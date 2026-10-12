import { NextResponse } from 'next/server';
import { checkExpirations } from '@/lib/notification-checker';

export async function POST(request: Request) {
  // Simple authorization via shared secret (for external cron)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await checkExpirations();
  return NextResponse.json(result);
}
