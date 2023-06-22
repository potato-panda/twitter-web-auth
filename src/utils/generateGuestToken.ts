import { request } from 'node:https';
import { _bearer } from '../constants';

export async function generateGuestToken() {
	return new Promise((resolve, reject) => {
		request('https://api.twitter.com/1.1/guest/activate.json', {
			method: 'POST',
		})
			.setHeader('Authorization', _bearer)
			.on('response', async (response) => {
				const responseEnd = new Promise<void>((resolve) => {
					response.on('end', () => {
						resolve();
					});
				});

				const chunks: Buffer[] = [];
				response
					.on('close', () => {})
					.on('readable', () => {
						response.read();
					})
					.on('data', (data: any) => {
						chunks.push(data);
					})
					.on('end', () => {})
					.on('error', (err: any) => {
						reject(err);
					});

				await responseEnd;
				const buf = Buffer.concat(chunks);
				const guestToken = JSON.parse(buf.toString())['guest_token'];
				resolve({ guestToken });
			})
			.on('error', () => new Error('Failed to retrieve Guest Token'))
			.end();
	});
}
