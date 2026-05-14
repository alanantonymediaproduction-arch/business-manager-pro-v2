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

    let earningsQuery = supabase.from('earnings').select('*');
    let expensesQuery = supabase.from('expenses').select('*');
    let commissionsQuery = supabase.from('commissions').select('*');
    let paymentsQuery = supabase.from('payments').select('id', { count: 'exact' }).eq('status', 'pending');

    if (linkedStaff) {
      earningsQuery = earningsQuery.eq('linked_staff_name', linkedStaff);
      commissionsQuery = commissionsQuery.eq('linked_staff_name', linkedStaff);
    } else {
      earningsQuery = earningsQuery.neq('linked_staff_name', 'Deepa');
      commissionsQuery = commissionsQuery.neq('linked_staff_name', 'Deepa');
    }

    const [
      { data: earnings, error: err1 },
      { data: expenses, error: err2 },
      { data: commissions, error: err3 },
      { count: pendingPaymentsCount, error: err4 }
    ] = await Promise.all([
      earningsQuery,
      expensesQuery,
      commissionsQuery,
      paymentsQuery
    ]);

    if (err1 || err2 || err3 || err4) throw new Error('Failed fetching from Supabase');

    const safeEarnings = earnings || [];
    const safeExpenses = expenses || [];
    const safeCommissions = commissions || [];

    const todayEarnings = safeEarnings.filter(e => new Date(e.created_at) >= startOfDay && new Date(e.created_at) <= endOfDay)
                                     .reduce((sum, e) => sum + Number(e.amount), 0);
    const totalEarnings = safeEarnings.reduce((sum, e) => sum + Number(e.amount), 0);
    
    const todayExpenses = safeExpenses.filter(e => new Date(e.created_at) >= startOfDay && new Date(e.created_at) <= endOfDay)
                                     .reduce((sum, e) => sum + Number(e.amount), 0);
                                     
    const todayCommissions = safeCommissions.filter(e => new Date(e.created_at) >= startOfDay && new Date(e.created_at) <= endOfDay)
                                           .reduce((sum, e) => sum + Number(e.amount), 0);
    const totalCommissions = safeCommissions.reduce((sum, e) => sum + Number(e.amount), 0);

    const netProfit = totalEarnings - (safeExpenses.reduce((sum, e) => sum + Number(e.amount), 0)) - totalCommissions;

    // Generate chart data for last 7 days
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d); dayStart.setHours(0,0,0,0);
      const dayEnd = new Date(d); dayEnd.setHours(23,59,59,999);
      
      const dayTotal = safeEarnings
        .filter(e => new Date(e.created_at) >= dayStart && new Date(e.created_at) <= dayEnd)
        .reduce((sum, e) => sum + Number(e.amount), 0);
        
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
