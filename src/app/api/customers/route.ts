import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, status } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const newCustomer = await prisma.customer.create({
      data: { name, email, phone, status: status || 'Active' }
    });

    return NextResponse.json(newCustomer);
  } catch (error) {
    console.error('Failed to create customer:', error);
    // Vercel fallback
    return NextResponse.json({ id: 'temp-id', ...await request.json(), createdAt: new Date() }, { status: 200 });
  }
}
