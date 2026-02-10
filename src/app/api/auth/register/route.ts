import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { validateEmail, validatePassword, validateName } from '@/lib/validation';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, name } = body;

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: 'bad_request', message: 'Email, password, and name are required' },
      { status: 400 },
    );
  }

  if (!validateEmail(email)) {
    return NextResponse.json(
      { error: 'bad_request', message: 'Invalid email format' },
      { status: 400 },
    );
  }

  const passwordResult = validatePassword(password);
  if (!passwordResult.valid) {
    return NextResponse.json(
      { error: 'bad_request', message: passwordResult.error },
      { status: 400 },
    );
  }

  const nameResult = validateName(name);
  if (!nameResult.valid) {
    return NextResponse.json(
      { error: 'bad_request', message: nameResult.error },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    return NextResponse.json(
      { error: 'conflict', message: 'Email already registered' },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name: name.trim(),
      },
    });

    return NextResponse.json(
      { id: user.id, email: user.email, name: user.name },
      { status: 201 },
    );
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'P2002') {
      return NextResponse.json(
        { error: 'conflict', message: 'Email already registered' },
        { status: 409 },
      );
    }
    throw err;
  }
}
