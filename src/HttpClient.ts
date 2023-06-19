import https from 'node:https';
import CookieJar from './CookieJar';

export default class HttpClient {
	private jar = new CookieJar();

	get cookieJar() {
		return this.jar;
	}

	async get(url: string, headers?: { [key: string]: string }) {
		return this.request(url, 'GET', undefined, headers);
	}

	async post(url: string, data?: any, headers?: { [key: string]: string }) {
		return this.request(url, 'POST', data, headers);
	}

	async request(
		url: string,
		method: 'GET' | 'POST',
		data?: any,
		headers?: { [key: string]: string },
	) {
		return await new Promise((resolve, reject) => {
			const request = https
				.request(url, {
					method,
					headers: {
						...headers,
						cookie: this.jar.toHeaderValue(),
					},
				})
				.on('response', async (response) => {
					const { headers, statusCode } = response;

					this.jar.parseSetCookieHeader(headers['set-cookie']);

					if (statusCode === 302) {
						const cookie = this.jar.toHeaderValue();
						const redirResponse = await this.get(url, {
							cookie,
						});
						resolve(redirResponse);
					}

					const chunks: Buffer[] = [];

					const responseEnd = new Promise<void>((resolve) => {
						response.on('end', () => {
							resolve();
						});
					});

					response
						.on('close', () => {})
						.on('readable', () => {
							response.read();
						})
						.on('data', (data) => {
							chunks.push(data);
						})
						.on('end', () => {})
						.on('error', (err) => {
							reject(err);
						});

					await responseEnd;
					const buf = Buffer.concat(chunks);
					resolve(buf);
				})
				.on('finish', () => {});

			data && request.write(JSON.stringify(data));

			request.end();
		});
	}
}
