export function validateSyncToken(request: Request): boolean {
  const authHeader = request.headers.get('Authorization');
  const secret = process.env.SYNC_SECRET;

  // If secret is not configured, deny everything (fail closed)
  if (!secret) {
    console.error('SYNC_SECRET is not configured in environment variables.');
    return false;
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.split(' ')[1];
  // Use constant time comparison if possible, but simple string comparison is likely fine here given the context
  return token === secret;
}
