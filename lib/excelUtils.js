import * as XLSX from 'xlsx';

/**
 * Converts an Excel serial date number (e.g. 46321) or string into YYYY-MM-DD
 */
export function formatExcelDate(val) {
  if (!val) return '';
  if (typeof val === 'number') {
    // Excel base date Dec 30 1899
    const utc_days = Math.floor(val - 25569);
    const date = new Date(utc_days * 86400 * 1000);
    return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : String(val);
  }
  const str = String(val).trim();
  // If it's already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  // If it's DD/MM/YYYY or MM/DD/YYYY
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    try {
      return d.toISOString().split('T')[0];
    } catch {
      return str;
    }
  }
  return str;
}

/**
 * Cleans phone strings, handles, and extracts readable names
 */
export function cleanPhoneOrHandle(raw) {
  if (!raw) return { phone: '', name: '' };
  const str = String(raw).replace(/\r|\n/g, ' ').trim();
  let name = str;
  let phone = str;

  if (str.startsWith('@')) {
    name = str.replace(/^@/, '').replace(/_/g, ' ');
    phone = str;
  } else if (str.includes('|')) {
    const parts = str.split('|').map(p => p.trim());
    name = parts[0] || parts[1];
    phone = parts[1] || parts[0];
  } else if (/\d{5,}/.test(str)) {
    // Has a phone number, check if a person name is appended (e.g. "880 1756-011660 Dr. Mahi")
    const match = str.match(/([0-9+\s\-()]{7,})\s*(.*)/);
    if (match) {
      phone = match[1].trim();
      name = match[2].trim() || phone;
    }
  }

  return { phone, name: name || phone };
}

/**
 * Universal Excel / CSV Reader
 * Automatically inspects all sheets, discovers header rows, and parses data into structured format
 * @param {File} file 
 * @param {'whatsapp' | 'outreach' | 'demo' | 'successful_client' | 'onboard' | 'auto'} typeHint
 */
export async function parseExcelOrCsvFile(file, typeHint = 'auto') {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target.result;
        const workbook = XLSX.read(buffer, { type: 'array' });
        
        let targetType = typeHint;
        if (targetType === 'auto') {
          // Detect type by scanning workbook sheets
          const allSheetNames = workbook.SheetNames.join(' ').toLowerCase();
          if (allSheetNames.includes('whatsapp') || allSheetNames.includes('november')) {
            targetType = 'whatsapp';
          } else if (allSheetNames.includes('outreach') || allSheetNames.includes('skin care')) {
            targetType = 'outreach';
          } else if (allSheetNames.includes('demo') || allSheetNames.includes('pick list')) {
            targetType = 'demo';
          } else if (allSheetNames.includes('successfull') || allSheetNames.includes('portfolio')) {
            targetType = 'successful_client';
          } else if (allSheetNames.includes('onboard')) {
            targetType = 'onboard';
          } else {
            targetType = 'whatsapp';
          }
        }

        if (targetType === 'whatsapp') {
          resolve(parseWhatsAppWorkbook(workbook));
        } else if (targetType === 'outreach') {
          resolve(parseOutreachWorkbook(workbook));
        } else if (targetType === 'demo') {
          resolve(parseDemoWorkbook(workbook));
        } else if (targetType === 'successful_client') {
          resolve(parseSuccessfulClientWorkbook(workbook));
        } else if (targetType === 'onboard') {
          resolve(parseOnboardWorkbook(workbook));
        } else {
          // Fallback generic
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
          resolve(rows);
        }
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parses WhatsApp Lead sheets (e.g. November, 3smediMarketing, potential, or standard sheet)
 */
export function parseWhatsAppWorkbook(workbook) {
  const leads = [];
  const todayStr = new Date().toISOString().split('T')[0];

  for (const sName of workbook.SheetNames) {
    if (sName.toLowerCase() === 'dashboard' || sName.toLowerCase() === 'lookup data' || sName.toLowerCase() === 'expence') {
      continue;
    }

    const sheet = workbook.Sheets[sName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (!rows || rows.length === 0) continue;

    // Find header row containing "WhatsApp Number" or "Phone" or "Call"
    let headerIdx = rows.findIndex(r => r.some(c => /whatsapp\s*number|phone\s*number|call\s*not/i.test(String(c))));
    
    // Fallback: row 0 or 1 if it has standard columns
    if (headerIdx === -1) {
      headerIdx = rows.findIndex(r => r.some(c => /date|requirement|status/i.test(String(c))));
    }
    if (headerIdx === -1 && rows.length > 0) {
      headerIdx = 0;
    }

    const header = rows[headerIdx].map(c => String(c).trim().toLowerCase());
    const colDate = header.findIndex(c => c.includes('date'));
    const colCallNotRec = header.findIndex(c => /not\s*receive|call\s*not/i.test(c));
    const colPhone = header.findIndex(c => /whatsapp|phone|mobile|contact/i.test(c));
    const colName = header.findIndex(c => c === 'name' || c === 'client name');
    const colReq = header.findIndex(c => /requirement|service/i.test(c));
    const colPriority = header.findIndex(c => /priority/i.test(c));
    const colPropStatus = header.findIndex(c => /proposal\s*status/i.test(c));
    const colOnboardStatus = header.findIndex(c => /onboard\s*status|status/i.test(c));
    const colF1 = header.findIndex(c => /1st\s*follow/i.test(c));
    const colF2 = header.findIndex(c => /2nd\s*follow/i.test(c));
    const colF3 = header.findIndex(c => /3rd\s*follow/i.test(c));
    const colFeedback = header.findIndex(c => /feedback|latest/i.test(c));
    const colNextAction = header.findIndex(c => /next\s*action/i.test(c));
    const colDealVal = header.findIndex(c => /deal\s*value|budget|cost|price/i.test(c));
    const colPlatform = header.findIndex(c => /platform/i.test(c));
    const colCampaign = header.findIndex(c => /campaign/i.test(c));
    const colCreative = header.findIndex(c => /ad\s*creative|creative/i.test(c));

    for (let i = headerIdx + 1; i < rows.length; i++) {
      const r = rows[i];
      const rawPhone = colPhone !== -1 ? String(r[colPhone] || '').trim() : '';
      const rawName = colName !== -1 ? String(r[colName] || '').trim() : '';
      if (!rawPhone && !rawName) continue;

      const { phone, name } = cleanPhoneOrHandle(rawPhone || rawName);
      const leadName = rawName || name;
      const dateVal = colDate !== -1 ? formatExcelDate(r[colDate]) : todayStr;
      
      const rawCall = colCallNotRec !== -1 ? r[colCallNotRec] : false;
      const callNotReceived = rawCall === true || String(rawCall).toLowerCase() === 'true' || String(rawCall).toLowerCase() === 'yes';

      const req = colReq !== -1 ? String(r[colReq] || '').trim() : 'Website Development';
      const rawPriority = colPriority !== -1 ? String(r[colPriority] || '').trim() : '';
      let priority = 'Medium ⚡';
      if (/high/i.test(rawPriority)) priority = 'High 🔥';
      else if (/low/i.test(rawPriority)) priority = 'Low 💤';
      else if (/medium/i.test(rawPriority)) priority = 'Medium ⚡';

      const propStatus = colPropStatus !== -1 && r[colPropStatus] ? String(r[colPropStatus]).trim() : 'Not Sent';
      const onboardStatus = colOnboardStatus !== -1 && r[colOnboardStatus] ? String(r[colOnboardStatus]).trim() : 'New Lead';
      
      const f1 = colF1 !== -1 ? String(r[colF1] || '').trim() : '';
      const f2 = colF2 !== -1 ? String(r[colF2] || '').trim() : '';
      const f3 = colF3 !== -1 ? String(r[colF3] || '').trim() : '';
      const feedback = colFeedback !== -1 ? String(r[colFeedback] || '').trim() : '';
      const nextAction = colNextAction !== -1 && r[colNextAction] ? String(r[colNextAction]).trim() : 'Follow Up';
      
      const rawDeal = colDealVal !== -1 ? String(r[colDealVal] || '') : '0';
      const dealValue = Number(rawDeal.replace(/[^0-9.]/g, '')) || 0;

      const platform = colPlatform !== -1 ? String(r[colPlatform] || '').trim() : '';
      const campaign = colCampaign !== -1 ? String(r[colCampaign] || '').trim() : '';
      const creative = colCreative !== -1 ? String(r[colCreative] || '').trim() : '';

      // Build follow up notes from non-empty follow-up columns
      const followUpNotes = [];
      if (f1) followUpNotes.push({ date: new Date(), note: `1st Follow-Up: ${f1}`, outcome: 'Follow Up' });
      if (f2) followUpNotes.push({ date: new Date(), note: `2nd Follow-Up: ${f2}`, outcome: 'Follow Up' });
      if (f3) followUpNotes.push({ date: new Date(), note: `3rd Follow-Up: ${f3}`, outcome: 'Follow Up' });
      if (feedback) followUpNotes.push({ date: new Date(), note: `Latest Feedback: ${feedback}`, outcome: 'Connected' });

      leads.push({
        name: leadName,
        phone,
        requirements: req,
        services: [req || 'Website Development'],
        callNotReceived,
        priority,
        proposalSentStatus: propStatus,
        onboardStatus,
        firstFollowUp: f1,
        secondFollowUp: f2,
        thirdFollowUp: f3,
        latestFeedback: feedback,
        nextAction,
        dealValue,
        estimatedBudget: dealValue,
        platform,
        campaignName: campaign,
        adCreative: creative,
        createdAt: dateVal ? new Date(dateVal).toISOString() : new Date().toISOString(),
        followUpDate: dateVal || todayStr,
        followUpTime: '11:00 AM',
        followUpNotes,
        leadSource: platform || 'WhatsApp Inbound'
      });
    }
  }

  return leads;
}

/**
 * Parses Outreach Lead sheets across all categories (Skin care, Real Estate, Dental clinic, etc.)
 */
export function parseOutreachWorkbook(workbook) {
  const list = [];
  const todayStr = new Date().toISOString().split('T')[0];

  for (const sName of workbook.SheetNames) {
    if (sName.toLowerCase().includes('summary') || sName.toLowerCase().includes('instructions')) {
      continue;
    }

    const sheet = workbook.Sheets[sName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (!rows || rows.length === 0) continue;

    const headerIdx = rows.findIndex(r => r.some(c => /business|company/i.test(String(c))));
    if (headerIdx === -1) continue;

    const header = rows[headerIdx].map(c => String(c).trim().toLowerCase());
    const colBus = header.findIndex(c => /business|company/i.test(c));
    const colPhone = header.findIndex(c => /phone|whatsapp|mobile/i.test(c));
    const colContacted = header.findIndex(c => /contacted/i.test(c));
    const colPriority = header.findIndex(c => /priority/i.test(c));
    const colFollowStatus = header.findIndex(c => /follow\s*up\s*status/i.test(c));
    const colNextFollowDate = header.findIndex(c => /next\s*follow.*date/i.test(c));
    const colF1 = header.findIndex(c => /1st\s*follow/i.test(c));
    const colF2 = header.findIndex(c => /2nd\s*follow/i.test(c));
    const colF3 = header.findIndex(c => /3rd\s*follow/i.test(c));
    const colMoreFollow = header.findIndex(c => /more\s*follow/i.test(c));
    const colPropStatus = header.findIndex(c => /proposal\s*status/i.test(c));
    const colNotes = header.findIndex(c => /notes/i.test(c));
    const colCategory = header.findIndex(c => /^category/i.test(c));
    const colOtherCat = header.findIndex(c => /other\s*categor/i.test(c));
    const colRank = header.findIndex(c => /map\s*rank/i.test(c));
    const colRating = header.findIndex(c => /rating/i.test(c));
    const colReviews = header.findIndex(c => /reviews/i.test(c));
    const colEmail = header.findIndex(c => /email/i.test(c));
    const colWeb = header.findIndex(c => /website/i.test(c));
    const colFb = header.findIndex(c => /facebook/i.test(c));
    const colIg = header.findIndex(c => /instagram/i.test(c));
    const colLi = header.findIndex(c => /linkedin/i.test(c));
    const colAddress = header.findIndex(c => /address/i.test(c));
    const colCms = header.findIndex(c => /cms/i.test(c));
    const colAnalytics = header.findIndex(c => /analytics/i.test(c));
    const colOppScore = header.findIndex(c => /opportunity\s*score/i.test(c));
    const colTemp = header.findIndex(c => /temperature/i.test(c));
    const colProblems = header.findIndex(c => /problems\s*found/i.test(c));
    const colGmaps = header.findIndex(c => /google\s*maps/i.test(c));

    for (let i = headerIdx + 1; i < rows.length; i++) {
      const r = rows[i];
      const bus = colBus !== -1 ? String(r[colBus] || '').trim() : '';
      const rawPhone = colPhone !== -1 ? String(r[colPhone] || '').trim() : '';
      if (!bus && !rawPhone) continue;

      const f1 = colF1 !== -1 ? String(r[colF1] || '').trim() : '';
      const f2 = colF2 !== -1 ? String(r[colF2] || '').trim() : '';
      const f3 = colF3 !== -1 ? String(r[colF3] || '').trim() : '';
      const more = colMoreFollow !== -1 ? String(r[colMoreFollow] || '').trim() : '';
      const notes = colNotes !== -1 ? String(r[colNotes] || '').trim() : '';

      const followUpNotes = [];
      if (f1) followUpNotes.push({ date: new Date(), note: `1st Follow-Up: ${f1}` });
      if (f2) followUpNotes.push({ date: new Date(), note: `2nd Follow-Up: ${f2}` });
      if (f3) followUpNotes.push({ date: new Date(), note: `3rd Follow-Up: ${f3}` });
      if (more) followUpNotes.push({ date: new Date(), note: `More Follow-Ups: ${more}` });

      list.push({
        business: bus,
        name: bus,
        company: bus,
        phone: rawPhone,
        contacted: colContacted !== -1 ? String(r[colContacted] || 'No').trim() : 'No',
        priority: colPriority !== -1 ? String(r[colPriority] || 'Medium').trim() : 'Medium',
        followUpStatus: colFollowStatus !== -1 ? String(r[colFollowStatus] || 'Not started').trim() : 'Not started',
        followUpDate: colNextFollowDate !== -1 ? formatExcelDate(r[colNextFollowDate]) : todayStr,
        firstFollowUp: f1,
        secondFollowUp: f2,
        thirdFollowUp: f3,
        moreFollowUps: more,
        proposalSentStatus: colPropStatus !== -1 ? String(r[colPropStatus] || 'Not sent').trim() : 'Not sent',
        generalNotes: notes,
        category: colCategory !== -1 && r[colCategory] ? String(r[colCategory]).trim() : sName,
        otherCategories: colOtherCat !== -1 ? String(r[colOtherCat] || '').trim() : '',
        mapRank: colRank !== -1 && r[colRank] !== '' ? Number(r[colRank]) || null : null,
        rating: colRating !== -1 && r[colRating] !== '' ? Number(r[colRating]) || null : null,
        reviews: colReviews !== -1 && r[colReviews] !== '' ? Number(r[colReviews]) || null : null,
        email: colEmail !== -1 ? String(r[colEmail] || '').trim() : '',
        website: colWeb !== -1 ? String(r[colWeb] || '').trim() : '',
        facebook: colFb !== -1 ? String(r[colFb] || '').trim() : '',
        instagram: colIg !== -1 ? String(r[colIg] || '').trim() : '',
        linkedin: colLi !== -1 ? String(r[colLi] || '').trim() : '',
        address: colAddress !== -1 ? String(r[colAddress] || '').trim() : '',
        cms: colCms !== -1 ? String(r[colCms] || '').trim() : '',
        analytics: colAnalytics !== -1 ? String(r[colAnalytics] || '').trim() : '',
        opportunityScore: colOppScore !== -1 && r[colOppScore] !== '' ? Number(r[colOppScore]) || null : null,
        temperature: colTemp !== -1 ? String(r[colTemp] || '').trim() : '',
        problemsFound: colProblems !== -1 ? String(r[colProblems] || '').trim() : '',
        googleMaps: colGmaps !== -1 ? String(r[colGmaps] || '').trim() : '',
        batchTag: sName,
        followUpNotes,
        services: ['Website Development', 'SEO (Search Engine Optimization)'],
        createdAt: new Date().toISOString()
      });
    }
  }

  return list;
}

/**
 * Parses Demo Links from Client List or Demo website sheets
 */
export function parseDemoWorkbook(workbook) {
  const demos = [];

  for (const sName of workbook.SheetNames) {
    if (sName.toLowerCase().includes('successfull') || sName.toLowerCase().includes('summary') || sName.toLowerCase().includes('how to use') || sName.toLowerCase().includes('pick lists')) {
      continue;
    }

    const sheet = workbook.Sheets[sName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (!rows || rows.length === 0) continue;

    const headerIdx = rows.findIndex(r => r.some(c => /url\s*\/\s*link|link\s*type/i.test(String(c))));
    if (headerIdx === -1) continue;

    const header = rows[headerIdx].map(c => String(c).trim().toLowerCase());
    const colCat = header.findIndex(c => c === 'category');
    const colBiz = header.findIndex(c => /business\s*type/i.test(c));
    const colClient = header.findIndex(c => /client|brand/i.test(c));
    const colUrl = header.findIndex(c => /url|link/i.test(c));
    const colType = header.findIndex(c => /link\s*type/i.test(c));
    const colUser = header.findIndex(c => /username/i.test(c));
    const colPass = header.findIndex(c => /password/i.test(c));
    const colNotes = header.findIndex(c => /notes/i.test(c));

    for (let i = headerIdx + 1; i < rows.length; i++) {
      const r = rows[i];
      const url = colUrl !== -1 ? String(r[colUrl] || '').trim() : '';
      const client = colClient !== -1 ? String(r[colClient] || '').trim() : '';
      if (!url && !client) continue;

      demos.push({
        title: client || 'Demo Project',
        clientName: client,
        businessType: colBiz !== -1 ? String(r[colBiz] || '').trim() : '',
        category: colCat !== -1 && r[colCat] ? String(r[colCat]).trim() : 'Web Design & Development',
        url,
        linkType: colType !== -1 ? String(r[colType] || 'Website').trim() : 'Website',
        username: colUser !== -1 ? String(r[colUser] || '').trim() : '',
        password: colPass !== -1 ? String(r[colPass] || '').trim() : '',
        notes: colNotes !== -1 ? String(r[colNotes] || '').trim() : '',
        createdAt: new Date().toISOString()
      });
    }
  }

  return demos;
}

/**
 * Parses Successful Client showcase entries
 */
export function parseSuccessfulClientWorkbook(workbook) {
  const list = [];

  for (const sName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (!rows || rows.length === 0) continue;

    const headerIdx = rows.findIndex(r => r.some(c => /service\s*\/\s*result|client\s*\/\s*brand|website\s*\/\s*keyword/i.test(String(c))));
    if (headerIdx === -1) continue;

    const header = rows[headerIdx].map(c => String(c).trim().toLowerCase());
    const colCat = header.findIndex(c => c === 'category');
    const colInd = header.findIndex(c => /industry/i.test(c));
    const colClient = header.findIndex(c => /client\s*\/\s*brand/i.test(c));
    const colWeb = header.findIndex(c => /website/i.test(c));
    const colService = header.findIndex(c => /service\s*\/\s*result/i.test(c));
    const colNotes = header.findIndex(c => /notes/i.test(c));

    for (let i = headerIdx + 1; i < rows.length; i++) {
      const r = rows[i];
      const client = colClient !== -1 ? String(r[colClient] || '').trim() : '';
      const web = colWeb !== -1 ? String(r[colWeb] || '').trim() : '';
      if (!client && !web) continue;
      if (client.toLowerCase().includes('total') || client.toLowerCase().includes('category summary')) continue;

      const liveUrl = web ? (web.startsWith('http') ? web : `https://${web}`) : '';

      list.push({
        clientName: client,
        businessName: client,
        category: colCat !== -1 && r[colCat] ? String(r[colCat]).trim() : 'Web Design & Development',
        industry: colInd !== -1 ? String(r[colInd] || '').trim() : '',
        website: web,
        liveWebsiteUrl: liveUrl,
        serviceResult: colService !== -1 ? String(r[colService] || '').trim() : '',
        notes: colNotes !== -1 ? String(r[colNotes] || '').trim() : '',
        createdAt: new Date().toISOString()
      });
    }
  }

  return list;
}

/**
 * Parses Onboarded Clients sheet
 */
export function parseOnboardWorkbook(workbook) {
  const clients = [];

  for (const sName of workbook.SheetNames) {
    if (!sName.toLowerCase().includes('onboard') && workbook.SheetNames.length > 1) {
      continue;
    }

    const sheet = workbook.Sheets[sName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (!rows || rows.length === 0) continue;

    const headerIdx = rows.findIndex(r => r.some(c => /amount\s*own|won\s*cost|details/i.test(String(c))));
    const startIdx = headerIdx !== -1 ? headerIdx + 1 : 0;

    for (let i = startIdx; i < rows.length; i++) {
      const r = rows[i];
      const col0 = String(r[0] || '').trim();
      const col1 = String(r[1] || '').trim();
      const col2 = String(r[2] || '').trim();
      const col3 = String(r[3] || '').trim();
      const col4 = String(r[4] || '').trim();
      if (!col0 && !col1 && !col2) continue;
      if (col0.toLowerCase().includes('total') || col1.toLowerCase().includes('total')) continue;

      const businessName = col0;
      const clientName = col1 || col0;
      const amountStr = col2;
      const wonMatch = amountStr.match(/(\d[\d,]*)/);
      const wonCost = wonMatch ? Number(wonMatch[1].replace(/,/g, '')) : 0;
      
      const paidMatch = amountStr.match(/paid\s*(\d[\d,]*)/i);
      const paidAmount = paidMatch ? Number(paidMatch[1].replace(/,/g, '')) : wonCost;

      const notes = [col3, col4].filter(Boolean).join(' - ');

      clients.push({
        businessName,
        clientName,
        phone: '',
        services: [col3 || 'Website Development'],
        askingCost: wonCost,
        wonCost,
        paidAmount,
        paymentStatus: paidAmount >= wonCost && wonCost > 0 ? 'Paid' : (paidAmount > 0 ? 'Partial' : 'Pending'),
        clientStatus: 'Active',
        notes,
        createdAt: new Date().toISOString()
      });
    }
  }

  return clients;
}

/**
 * Exports data to an Excel (.xlsx) file safely in all browser environments
 */
export function exportToExcel(data, filename = 'export.xlsx', sheetName = 'Sheet1') {
  if (!data || !Array.isArray(data) || data.length === 0) {
    alert('No data available to export for the current filter.');
    return;
  }

  try {
    // Excel sheet name: max 31 chars, no special prohibited characters
    const safeSheetName = (sheetName || 'Sheet1')
      .slice(0, 31)
      .replace(/[:\\/?*[\]]/g, '_');

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);

    // Generate binary buffer using write (NOT writeFile which fails in browser)
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' 
    });

    const safeFilename = filename.toLowerCase().endsWith('.xlsx') ? filename : `${filename}.xlsx`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = safeFilename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    console.error('Error exporting to Excel:', err);
    alert('Failed to export Excel file: ' + err.message);
  }
}

/**
 * Exports data to a CSV file safely with UTF-8 BOM for Excel compatibility
 */
export function exportToCsv(data, filename = 'export.csv') {
  if (!data || !Array.isArray(data) || data.length === 0) {
    alert('No data available to export for the current filter.');
    return;
  }

  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    
    // Add UTF-8 Byte Order Mark (\uFEFF) so Excel displays ৳ (BDT) and special characters properly
    const blob = new Blob(['\uFEFF' + csvOutput], { type: 'text/csv;charset=utf-8;' });
    const safeFilename = filename.toLowerCase().endsWith('.csv') ? filename : `${filename}.csv`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = safeFilename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    console.error('Error exporting to CSV:', err);
    alert('Failed to export CSV file: ' + err.message);
  }
}
