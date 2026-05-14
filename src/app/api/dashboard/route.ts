import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const fetchSpecialPersona = searchParams.get('is_special_persona') === 'true'; 

    // Today's boundaries
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch financial records
    const { data: financialRecords, error: finError } = await supabase
      .from('financial_records')
      .select('*')
      .eq('is_special_persona', fetchSpecialPersona);

    if (finError) throw finError;
    const safeRecords = financialRecords || [];

    let todayEarnings = 0, totalEarnings = 0;
    let todayCommissions = 0, totalCommissions = 0;
    let todayExpenses = 0, totalExpenses = 0;
    const chartDataMap: Record<string, number> = {};

    safeRecords.forEach(record => {
      const recordDate = new Date(record.created_at);
      const isToday = recordDate >= startOfDay && recordDate <= endOfDay;
      const amount = Number(record.amount);

      if (record.type === 'Earning') {
        totalEarnings += amount;
        if (isToday) todayEarnings += amount;
      }
      if (record.type === 'Commission') {
        totalCommissions += amount;
        if (isToday) todayCommissions += amount;
      }
      if (record.type === 'Expense') {
        totalExpenses += amount;
        if (isToday) todayExpenses += amount;
      }

      const dayKey = recordDate.toLocaleDateString('en-US', { weekday: 'short' });
      if (!chartDataMap[dayKey]) chartDataMap[dayKey] = 0;
      if (record.type === 'Earning') chartDataMap[dayKey] += amount;
      if (record.type === 'Commission') chartDataMap[dayKey] -= amount;
    });

    const companyShare = totalEarnings - totalCommissions;
    const netProfit = companyShare - totalExpenses;
    const chartData = Object.keys(chartDataMap).map(key => ({ name: key, value: chartDataMap[key] })).slice(-7);

    // Customer stats (only for main dashboard)
    let totalCustomers = 0, repeatCustomers = 0, malluCustomers = 0;
    let onlineEarnings = 0, onlineSessions = 0;

    if (!fetchSpecialPersona) {
      const { count: custCount } = await supabase.from('customers').select('*', { count: 'exact', head: true });
      totalCustomers = custCount || 0;

      const { count: repeatCount } = await supabase.from('customers').select('*', { count: 'exact', head: true }).eq('is_repeat', true);
      repeatCustomers = repeatCount || 0;

      const { count: malluCount } = await supabase.from('customers').select('*', { count: 'exact', head: true }).eq('is_mallu', true);
      malluCustomers = malluCount || 0;

      // Online services stats
      const { data: onlineData } = await supabase.from('online_services').select('amount').eq('user_id', user.id);
      if (onlineData) {
        onlineSessions = onlineData.length;
        onlineEarnings = onlineData.reduce((sum, r) => sum + Number(r.amount), 0);
      }
    }

    return NextResponse.json({
      todayEarnings, todayCommissions, totalEarnings, totalCommissions,
      companyShare, todayExpenses, pendingPayments: 0, netProfit, chartData,
      totalCustomers, repeatCustomers, malluCustomers,
      onlineEarnings, onlineSessions
    });
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
