# twitter-web-auth
Generates Twitter web auth token

### Get auth token

```typescript
const response = await getAuthToken({email, username, password [, csrfToken]});
// response
//  {
//    "authToken": "<authToken>",
//    "csrfToken": "<csrfToken>",
//    "guestToken": "<guestToken>"
//  }
```

### Get only guest token

```typescript
const response = await getAuthToken();
// response
//  {
//    "csrfToken": "<csrfToken>",
//    "guestToken": "<guestToken>"
//  }
```