import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const fetchSpecialPersona = searchParams.get('is_special_persona') === 'true'; 

    // Today's boundaries
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch financial records exclusively for this user (RLS enforces this automatically)
    // We filter by is_special_persona to isolate the dynamic persona data from general data
    const { data: financialRecords, error: finError } = await supabase
      .from('financial_records')
      .select('*')
      .eq('is_special_persona', fetchSpecialPersona);

    if (finError) throw finError;

    const safeRecords = financialRecords || [];

    // Calculate metrics
    let todayEarnings = 0;
    let totalEarnings = 0;
    let todayCommissions = 0;
    let totalCommissions = 0;
    let todayExpenses = 0;
    let totalExpenses = 0;

    const chartDataMap: Record<string, number> = {};

    safeRecords.forEach(record => {
      const recordDate = new Date(record.created_at);
      const isToday = recordDate >= startOfDay && recordDate <= endOfDay;
      const amount = Number(record.amount);
      const isEarning = record.type === 'Earning';
      const isCommission = record.type === 'Commission';
      const isExpense = record.type === 'Expense';

      if (isEarning) {
        totalEarnings += amount;
        if (isToday) todayEarnings += amount;
      }
      if (isCommission) {
        totalCommissions += amount;
        if (isToday) todayCommissions += amount;
      }
      if (isExpense) {
        totalExpenses += amount;
        if (isToday) todayExpenses += amount;
      }

      // Chart Data Calculation
      const dayKey = recordDate.toLocaleDateString('en-US', { weekday: 'short' });
      if (!chartDataMap[dayKey]) chartDataMap[dayKey] = 0;
      if (isEarning) chartDataMap[dayKey] += amount;
      if (isCommission) chartDataMap[dayKey] -= amount; // Net Company Share for that day
    });

    const companyShare = totalEarnings - totalCommissions;
    const netProfit = companyShare - totalExpenses;

    const chartData = Object.keys(chartDataMap).map(key => ({
      name: key,
      value: chartDataMap[key]
    })).slice(-7); // Get last 7 days roughly

    return NextResponse.json({
      todayEarnings,
      todayCommissions,
      totalEarnings,
      totalCommissions,
      companyShare,
      todayExpenses,
      pendingPayments: 0,
      netProfit,
      chartData
    });
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
