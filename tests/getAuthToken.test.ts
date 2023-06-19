import { env } from 'node:process';
import { describe, expect, it } from 'vitest';
import { getAuthToken } from '../src/getAuthToken';

describe('web login flow', () => {
  const { TWITTER_EMAIL, TWITTER_USERNAME, TWITTER_PASSWORD } = env;
  expect(TWITTER_EMAIL).toBeTruthy();
  expect(TWITTER_USERNAME).toBeTruthy();
  expect(TWITTER_PASSWORD).toBeTruthy();

  it('should not return an auth token if credentials are not provided', async () => {
    const response = getAuthToken();
    expect(response).resolves.not.toHaveProperty('authToken');
    expect(response).resolves.toHaveProperty('guestToken');
  });

  it('should return a guest token if credentials are not provided', async () => {
    const response = getAuthToken();
    expect(response).resolves.toHaveProperty('guestToken');
  });

  it('should return an auth token if credentials are provided', async () => {
    const credentials = {
      email: TWITTER_EMAIL ?? '',
      username: TWITTER_USERNAME ?? '',
      password: TWITTER_PASSWORD ?? ''
    };
    const response = getAuthToken(credentials);
    expect(response).resolves.toHaveProperty('authToken');
  });
});
