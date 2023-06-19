import { log } from 'node:console';
import { env } from 'node:process';

export function debug(...message: any) {
	if (env.NODE_ENV?.toLowerCase() === 'dev' && env.DEBUG) log(message);
}
