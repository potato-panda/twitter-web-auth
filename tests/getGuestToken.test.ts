import { expect, it } from 'vitest';
import { generateGuestToken } from '../src/utils/generateGuestToken';

it('should return a guest token and a csrf token', async () => {
	const response = generateGuestToken();
	expect(response).resolves.toHaveProperty('guestToken');
});
