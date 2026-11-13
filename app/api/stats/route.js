import { NextResponse } from 'next/server';
import { getLeads, getOutreachLeads, getClients } from '@/lib/store';

export async function GET() {
  try {
    const leads = await getLeads();
    const outreach = await getOutreachLeads();
    const clients = await getClients();

    const todayStr = new Date().toISOString().split('T')[0];

    // Follow-up status calculation
    let dueTodayFollowUps = 0;
    let overdueFollowUps = 0;
    let upcomingFollowUps = 0;

    leads.forEach((l) => {
      if (l.followUpDate) {
        if (l.followUpDate === todayStr) {
          dueTodayFollowUps++;
        } else if (l.followUpDate < todayStr) {
          overdueFollowUps++;
        } else {
          upcomingFollowUps++;
        }
      }
    });

    outreach.forEach((o) => {
      if (o.followUpDate) {
        if (o.followUpDate === todayStr) {
          dueTodayFollowUps++;
        } else if (o.followUpDate < todayStr) {
          overdueFollowUps++;
        } else {
          upcomingFollowUps++;
        }
      }
    });

    // Potentiality breakdown
    const potentialCounts = {
      Hot: leads.filter((l) => l.potentialityStatus === 'Hot').length,
      Warm: leads.filter((l) => l.potentialityStatus === 'Warm').length,
      Cold: leads.filter((l) => l.potentialityStatus === 'Cold').length,
      Lost: leads.filter((l) => l.potentialityStatus === 'Lost').length,
      Converted: leads.filter((l) => l.potentialityStatus === 'Converted').length,
    };

    // Revenue calculations
    const totalAskingCost = clients.reduce((sum, c) => sum + (Number(c.askingCost) || 0), 0);
    const totalWonCost = clients.reduce((sum, c) => sum + (Number(c.wonCost) || 0), 0);
    const totalCollected = clients.reduce((sum, c) => sum + (Number(c.paidAmount) || 0), 0);
    const totalPending = totalWonCost - totalCollected;

    // Services distribution
    const serviceDistribution = {};
    leads.forEach((l) => {
      (l.services || []).forEach((srv) => {
        serviceDistribution[srv] = (serviceDistribution[srv] || 0) + 1;
      });
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalLeads: leads.length,
        totalOutreach: outreach.length,
        totalClients: clients.length,
        dueTodayFollowUps,
        overdueFollowUps,
        upcomingFollowUps,
        potentialCounts,
        revenue: {
          totalAskingCost,
          totalWonCost,
          totalCollected,
          totalPending: Math.max(0, totalPending),
        },
        serviceDistribution,
      },
    });
  } catch (error) {
    console.error('API Error in GET /api/stats:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

