// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../src/lib/notification-checker', () => ({
  checkExpirations: vi.fn(async () => ({ sent: 0 })),
}));

import { POST } from '../../src/app/api/push/check-expirations/route';
import { checkExpirations } from '../../src/lib/notification-checker';

function request(authorization?: string) {
  return new Request('http://localhost/api/push/check-expirations', {
    method: 'POST',
    headers: authorization ? { authorization } : {},
  });
}

describe('POST /api/push/check-expirations', () => {
  beforeEach(() => {
    vi.mocked(checkExpirations).mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('rejects all requests when CRON_SECRET is unset', async () => {
    vi.stubEnv('CRON_SECRET', '');
    const res = await POST(request());
    expect(res.status).toBe(401);
    expect(checkExpirations).not.toHaveBeenCalled();
  });

  it('rejects a wrong bearer token', async () => {
    vi.stubEnv('CRON_SECRET', 's3cret');
    const res = await POST(request('Bearer nope'));
    expect(res.status).toBe(401);
    expect(checkExpirations).not.toHaveBeenCalled();
  });

  it('runs the check with the correct bearer token', async () => {
    vi.stubEnv('CRON_SECRET', 's3cret');
    const res = await POST(request('Bearer s3cret'));
    expect(res.status).toBe(200);
    expect(checkExpirations).toHaveBeenCalledOnce();
  });
});
