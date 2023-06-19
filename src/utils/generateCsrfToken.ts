import { randomUUID } from 'node:crypto';

export function generateCsrfToken() {
  return randomUUID().replace(/-/g, '');
}
