import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // For now we just acknowledge; wiring to CRM/email can be done later.
    return NextResponse.json({ ok: true, received: body });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
