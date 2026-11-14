import { NextResponse } from 'next/server';
import { getLeads, getOutreachLeads, getClients, getSuccessfulClients } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || '';
    const month = searchParams.get('month') || '';
    const year = searchParams.get('year') || '';

    const leads = await getLeads({ date, month, year });
    const outreach = await getOutreachLeads({ date, month, year });
    const clients = await getClients({ date, month, year });
    const successfulClients = await getSuccessfulClients();

    const todayStr = new Date().toISOString().split('T')[0];

    // Detailed Follow-up analysis
    let dueTodayFollowUps = [];
    let overdueFollowUps = [];
    let upcomingFollowUps = [];

    leads.forEach((l) => {
      if (l.followUpDate) {
        const itemInfo = {
          _id: l._id,
          name: l.name,
          phone: l.phone,
          service: (l.services || [])[0] || 'Digital Services',
          requirements: l.requirements,
          followUpDate: l.followUpDate,
          followUpTime: l.followUpTime || '11:00 AM',
          type: 'WhatsApp Lead',
          potentialityStatus: l.potentialityStatus,
          notesCount: (l.followUpNotes || []).length
        };
        if (l.followUpDate === todayStr) {
          dueTodayFollowUps.push(itemInfo);
        } else if (l.followUpDate < todayStr) {
          overdueFollowUps.push(itemInfo);
        } else {
          upcomingFollowUps.push(itemInfo);
        }
      }
    });

    outreach.forEach((o) => {
      if (o.followUpDate) {
        const itemInfo = {
          _id: o._id,
          name: o.name,
          company: o.company,
          phone: o.phone,
          service: (o.services || [])[0] || 'Outreach',
          requirements: o.generalNotes,
          followUpDate: o.followUpDate,
          followUpTime: '11:00 AM',
          type: 'Cold Outreach',
          potentialityStatus: o.potentialityStatus,
          notesCount: (o.followUpNotes || []).length
        };
        if (o.followUpDate === todayStr) {
          dueTodayFollowUps.push(itemInfo);
        } else if (o.followUpDate < todayStr) {
          overdueFollowUps.push(itemInfo);
        } else {
          upcomingFollowUps.push(itemInfo);
        }
      }
    });

    // Potentiality breakdown
    const potentialCounts = {
      Hot: leads.filter((l) => l.potentialityStatus === 'Hot').length,
      Warm: leads.filter((l) => l.potentialityStatus === 'Warm').length,
      Cold: leads.filter((l) => l.potentialityStatus === 'Cold').length,
      Converted: leads.filter((l) => l.potentialityStatus === 'Converted').length,
      Lost: leads.filter((l) => l.potentialityStatus === 'Lost').length,
    };

    // Revenue calculations in BDT (৳)
    const totalAskingCost = clients.reduce((sum, c) => sum + (Number(c.askingCost) || 0), 0);
    const totalWonCost = clients.reduce((sum, c) => sum + (Number(c.wonCost) || 0), 0);
    const totalCollected = clients.reduce((sum, c) => sum + (Number(c.paidAmount) || 0), 0);
    const totalPending = Math.max(0, totalWonCost - totalCollected);

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
        totalSuccessfulClients: successfulClients.length,
        dueTodayCount: dueTodayFollowUps.length,
        overdueCount: overdueFollowUps.length,
        upcomingCount: upcomingFollowUps.length,
        dueTodayFollowUps,
        overdueFollowUps,
        upcomingFollowUps,
        potentialCounts,
        revenue: {
          totalAskingCost,
          totalWonCost,
          totalCollected,
          totalPending,
        },
        serviceDistribution,
      },
    });
  } catch (error) {
    console.error('API Error in GET /api/stats:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
