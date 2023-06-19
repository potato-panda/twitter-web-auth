import { env } from 'node:process';
import { describe, expect, it } from 'vitest';
import { getAuthToken } from '../src/getAuthToken';
import { generateCsrfToken } from '../src/utils/generateCsrfToken';

describe('web login flow', () => {
  it('should not return an auth token if credentials are not provided', async () => {
    const response = getAuthToken();
    expect(response).resolves.not.toHaveProperty('authToken');
  });

  it('should return a guest token if credentials are not provided', async () => {
    const response = getAuthToken();
    expect(response).resolves.toHaveProperty('guestToken');
  });

  it('should return an auth token if credentials are provided', async () => {
    const { TWITTER_EMAIL, TWITTER_USERNAME, TWITTER_PASSWORD } = env;
    expect(TWITTER_EMAIL).toBeTruthy();
    expect(TWITTER_USERNAME).toBeTruthy();
    expect(TWITTER_PASSWORD).toBeTruthy();

    const credentials = {
      email: TWITTER_EMAIL ?? '',
      username: TWITTER_USERNAME ?? '',
      password: TWITTER_PASSWORD ?? '',
      csrfToken: generateCsrfToken(),
    };
    const response = getAuthToken(credentials);
    expect(response).resolves.toHaveProperty('authToken');
  });
});
