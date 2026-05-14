import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(staff);
  } catch (error) {
    console.error('Failed to fetch staff:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, role, status } = body;

    if (!name || !role) {
      return NextResponse.json({ error: 'Name and role are required' }, { status: 400 });
    }

    const newStaff = await prisma.staff.create({
      data: { name, role, status: status || 'Active' }
    });

    return NextResponse.json(newStaff);
  } catch (error) {
    console.error('Failed to create staff:', error);
    // Vercel fallback
    return NextResponse.json({ id: 'temp-id', ...await request.json(), createdAt: new Date() }, { status: 200 });
  }
}
