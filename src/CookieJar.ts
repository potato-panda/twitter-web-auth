export default class CookieJar {
	private readonly _cookies: { [key: string]: string } = {};

	setCookies(cookie: { [key: string]: string }[]) {
		for (const { key, value } of cookie) {
			this._cookies[key] = value;
		}
	}

	get cookies() {
		return { ...this._cookies };
	}

	parseSetCookieHeader(cookies?: string[]) {
		if (!cookies) return undefined;
		this.setCookies(
			cookies.map((set) => {
				const cookie = set.split(';')[0];
				const keyValue = cookie.split('=');
				const key = keyValue.shift() ?? '';
				const value = keyValue.join('=');
				return {
					key,
					value,
				};
			}),
		);
	}

	toHeaderValue() {
		return Object.keys(this._cookies)
			.map((key) => [key, this._cookies[key]].join('='))
			.join('; ');
	}
}
