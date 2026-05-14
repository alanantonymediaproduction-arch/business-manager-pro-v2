import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const linkedStaff = searchParams.get('linked_staff_name'); // For Deepa's Dashboard

    // Today's boundaries
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let customersQuery = supabase.from('customers').select('*');
    let expensesQuery = supabase.from('expenses').select('*');
    let paymentsQuery = supabase.from('payments').select('id', { count: 'exact' }).eq('status', 'pending');

    if (linkedStaff) {
      customersQuery = customersQuery.eq('staff_name', linkedStaff);
    } else {
      customersQuery = customersQuery.neq('staff_name', 'Deepa');
    }

    const [
      { data: customers, error: err1 },
      { data: expenses, error: err2 },
      { count: pendingPaymentsCount, error: err4 }
    ] = await Promise.all([
      customersQuery,
      expensesQuery,
      paymentsQuery
    ]);

    if (err1 || err2 || err4) throw new Error('Failed fetching from Supabase');

    const safeCustomers = customers || [];
    const safeExpenses = expenses || [];

    // Customer financial aggregation
    const todayEarnings = safeCustomers.filter(c => new Date(c.created_at) >= startOfDay && new Date(c.created_at) <= endOfDay)
                                     .reduce((sum, c) => sum + Number(c.total_paid_amount || 0), 0);
    const totalEarnings = safeCustomers.reduce((sum, c) => sum + Number(c.total_paid_amount || 0), 0);
    
    const todayCommissions = safeCustomers.filter(c => new Date(c.created_at) >= startOfDay && new Date(c.created_at) <= endOfDay)
                                           .reduce((sum, c) => sum + Number(c.amount_paid_to_staff || 0), 0);
    const totalCommissions = safeCustomers.reduce((sum, c) => sum + Number(c.amount_paid_to_staff || 0), 0);

    const todayExpenses = safeExpenses.filter(e => new Date(e.created_at) >= startOfDay && new Date(e.created_at) <= endOfDay)
                                     .reduce((sum, e) => sum + Number(e.amount), 0);

    // Company Share = Total Paid Amount - Amount Paid to Staff
    const companyShare = totalEarnings - totalCommissions;
    
    // Net profit accounts for general expenses too
    const totalExpenses = safeExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const netProfit = companyShare - totalExpenses;

    // Generate chart data for last 7 days (based on Company Share)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d); dayStart.setHours(0,0,0,0);
      const dayEnd = new Date(d); dayEnd.setHours(23,59,59,999);
      
      const dayTotal = safeCustomers
        .filter(c => new Date(c.created_at) >= dayStart && new Date(c.created_at) <= dayEnd)
        .reduce((sum, c) => sum + (Number(c.total_paid_amount || 0) - Number(c.amount_paid_to_staff || 0)), 0);
        
      chartData.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        value: dayTotal
      });
    }

    return NextResponse.json({
      todayEarnings,
      todayCommissions,
      totalEarnings,
      totalCommissions,
      companyShare,
      todayExpenses,
      pendingPayments: pendingPaymentsCount || 0,
      netProfit,
      chartData
    });
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
