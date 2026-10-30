import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Format currency to LKR string
 */
const formatLKR = (val) => {
  const num = Number(val) || 0;
  return `Rs. ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * 1. Overview Funding Sources Report
 * Generates pure table only (No letterhead / extra metadata)
 */
export function generateOverviewReport(format, {
  fundingSources = [],
  totalAllocation = 0,
  totalUtilized = 0,
  totalBalance = 0,
  overallRate = '0.0%',
}) {
  if (format === 'excel') {
    const wb = XLSX.utils.book_new();

    const data = [
      [
        '#',
        'Funding Programme (වැඩසටහන)',
        'Total Allocation (Rs.)',
        'Share (%)',
        'Disbursed / Utilized (Rs.)',
        'Balance (Rs.)',
        'Utilization Rate (%)',
        'Status'
      ],
      ...fundingSources.map((f, idx) => [
        idx + 1,
        f.name,
        f.amount,
        f.percentage,
        f.utilized,
        f.balance,
        f.utilizationRate,
        'Active'
      ]),
      [
        'TOTAL / එකතුව',
        `All (${fundingSources.length}) Programmes`,
        totalAllocation,
        '100.0%',
        totalUtilized,
        totalBalance,
        overallRate,
        'Consolidated'
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Auto column widths
    ws['!cols'] = [
      { wch: 6 },
      { wch: 32 },
      { wch: 22 },
      { wch: 14 },
      { wch: 24 },
      { wch: 22 },
      { wch: 22 },
      { wch: 16 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Funding Overview');
    XLSX.writeFile(wb, `Funding_Overview_${Date.now()}.xlsx`);
    return true;
  }

  if (format === 'pdf') {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const tableBody = fundingSources.map((f, idx) => [
      idx + 1,
      f.name,
      f.percentage,
      formatLKR(f.amount),
      formatLKR(f.utilized),
      formatLKR(f.balance),
      f.utilizationRate
    ]);

    const tableFoot = [
      [
        '',
        'TOTAL SUMMARY',
        '100.0%',
        formatLKR(totalAllocation),
        formatLKR(totalUtilized),
        formatLKR(totalBalance),
        overallRate
      ]
    ];

    // Direct table only without letterhead/extra headers
    autoTable(doc, {
      startY: 12,
      head: [['#', 'Funding Programme', 'Share (%)', 'Allocation (LKR)', 'Disbursed (LKR)', 'Balance (LKR)', 'Progress']],
      body: tableBody,
      foot: tableFoot,
      theme: 'grid',
      headStyles: {
        fillColor: [21, 128, 61],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
        halign: 'left',
      },
      footStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { fontStyle: 'bold', cellWidth: 46 },
        2: { halign: 'center', cellWidth: 20 },
        3: { halign: 'right', cellWidth: 32 },
        4: { halign: 'right', cellWidth: 32 },
        5: { halign: 'right', cellWidth: 30 },
        6: { halign: 'center', cellWidth: 20 }
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: [30, 41, 59]
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      }
    });

    doc.save(`Funding_Overview_${Date.now()}.pdf`);
    return true;
  }

  return false;
}

/**
 * 2. Detailed Progress Sheet Report (13-14 Columns Government Format)
 * Generates pure table only (No letterhead / extra metadata)
 */
export function generateDetailedSheetReport(format, {
  fundName = 'CF',
  records = [],
  sheetTotals = {},
}) {
  if (format === 'excel') {
    const wb = XLSX.utils.book_new();

    const data = [
      [
        '#',
        'විෂය / කාර්යය (Subject / Activity)',
        'DATE (දිනය)',
        'Activity No',
        'Budget Code',
        'Source Of Funding',
        'Allocation (Rs.) ප්‍රතිපාදන',
        'Expenditure (Rs.) වියදම',
        '% මූල්‍ය ප්‍රගතිය',
        'Balance (Rs.) ඉතිරිය',
        'වැඩසටහන් ගණන',
        'ඉලක්කගත ගණන',
        'සහභාගී වූ ගණන',
        'සහභාගීත්වයේ ප්‍රතිශතය (%)'
      ],
      ...records.map((r, idx) => {
        const bal = Math.max(0, (r.allocation || 0) - (r.expenditure || 0));
        const finP = r.allocation > 0 ? ((r.expenditure / r.allocation) * 100).toFixed(1) + '%' : '-';
        const partP = r.targetCount > 0 ? Math.round((r.actualCount / r.targetCount) * 100) + '%' : '-';
        return [
          idx + 1,
          r.subject || '',
          r.date || '',
          r.activityNo || '',
          r.budgetCode || '',
          r.sourceOfFunding || fundName,
          r.allocation || 0,
          r.expenditure || 0,
          finP,
          bal,
          r.programCount || 0,
          r.targetCount || 0,
          r.actualCount || 0,
          partP
        ];
      }),
      [
        '',
        'Total / එකතුව',
        '',
        '',
        '',
        '',
        sheetTotals.allocation || 0,
        sheetTotals.expenditure || 0,
        sheetTotals.overallFinPercent || '0%',
        sheetTotals.balance || 0,
        sheetTotals.programCount || 0,
        sheetTotals.targetCount || 0,
        sheetTotals.actualCount || 0,
        sheetTotals.overallPartPercent || '0%'
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Column widths
    ws['!cols'] = [
      { wch: 5 },
      { wch: 38 },
      { wch: 12 },
      { wch: 14 },
      { wch: 22 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 12 },
      { wch: 18 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 20 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, `${fundName} Progress`);
    XLSX.writeFile(wb, `${fundName}_Progress_Provisions_Sheet_${Date.now()}.xlsx`);
    return true;
  }

  if (format === 'pdf') {
    // Landscape A4 for wide 13-14 column sheet without letterhead
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const tableBody = records.map((r, idx) => {
      const bal = Math.max(0, (r.allocation || 0) - (r.expenditure || 0));
      const finP = r.allocation > 0 ? ((r.expenditure / r.allocation) * 100).toFixed(1) + '%' : '-';
      const partP = r.targetCount > 0 ? Math.round((r.actualCount / r.targetCount) * 100) + '%' : '-';

      return [
        idx + 1,
        r.subject || '',
        r.date || '',
        r.activityNo || '',
        r.budgetCode || '',
        r.sourceOfFunding || fundName,
        (r.allocation || 0).toLocaleString('en-US'),
        (r.expenditure || 0).toLocaleString('en-US'),
        finP,
        bal.toLocaleString('en-US'),
        r.programCount || 0,
        (r.targetCount || 0).toLocaleString('en-US'),
        (r.actualCount || 0).toLocaleString('en-US'),
        partP
      ];
    });

    const tableFoot = [
      [
        '',
        'TOTAL / එකතුව',
        '',
        '',
        '',
        '',
        sheetTotals.allocationFormatted || '',
        sheetTotals.expenditureFormatted || '',
        sheetTotals.overallFinPercent || '',
        sheetTotals.balanceFormatted || '',
        sheetTotals.programCount || '',
        sheetTotals.targetCount || '',
        sheetTotals.actualCount || '',
        sheetTotals.overallPartPercent || ''
      ]
    ];

    // Direct table only starting from top
    autoTable(doc, {
      startY: 10,
      head: [[
        '#',
        'Subject / Activity',
        'Date',
        'Activity #',
        'Budget Code',
        'Source',
        'Alloc (Rs)',
        'Exp (Rs)',
        'Fin %',
        'Balance (Rs)',
        'Prog',
        'Target',
        'Actual',
        'Part %'
      ]],
      body: tableBody,
      foot: tableFoot,
      theme: 'grid',
      headStyles: {
        fillColor: [21, 128, 61],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'center',
      },
      footStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'right'
      },
      styles: {
        fontSize: 7,
        cellPadding: 1.8,
        textColor: [30, 41, 59]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        1: { cellWidth: 50, fontStyle: 'bold' },
        2: { halign: 'center', cellWidth: 16 },
        3: { halign: 'center', cellWidth: 16 },
        4: { cellWidth: 24 },
        5: { halign: 'center', cellWidth: 16 },
        6: { halign: 'right', cellWidth: 22 },
        7: { halign: 'right', cellWidth: 22 },
        8: { halign: 'center', cellWidth: 14 },
        9: { halign: 'right', cellWidth: 22 },
        10: { halign: 'center', cellWidth: 12 },
        11: { halign: 'center', cellWidth: 14 },
        12: { halign: 'center', cellWidth: 14 },
        13: { halign: 'center', cellWidth: 16 }
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      }
    });

    doc.save(`${fundName}_Progress_Provisions_Sheet_${Date.now()}.pdf`);
    return true;
  }

  return false;
}

/**
 * 3. Registered Officers / User Accounts Report
 * Generates pure table only (No letterhead / extra metadata)
 */
export function generateUsersReport(format, {
  users = [],
}) {
  if (format === 'excel') {
    const wb = XLSX.utils.book_new();

    const data = [
      [
        '#',
        'Full Name',
        'Email Address',
        'Role',
        'Office / School',
        'Employee ID',
        'Account Status',
        'Registered Date'
      ],
      ...users.map((u, idx) => [
        idx + 1,
        u.name || '',
        u.email || '',
        u.role || '',
        u.office || '',
        u.employeeId || 'N/A',
        u.status || 'active',
        u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB') : 'N/A'
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);

    ws['!cols'] = [
      { wch: 5 },
      { wch: 28 },
      { wch: 32 },
      { wch: 16 },
      { wch: 30 },
      { wch: 18 },
      { wch: 16 },
      { wch: 18 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Users Directory');
    XLSX.writeFile(wb, `User_Accounts_${Date.now()}.xlsx`);
    return true;
  }

  if (format === 'pdf') {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const tableBody = users.map((u, idx) => [
      idx + 1,
      u.name || '',
      u.email || '',
      u.role || '',
      u.office || '',
      u.employeeId || '-',
      (u.status || 'active').toUpperCase()
    ]);

    autoTable(doc, {
      startY: 12,
      head: [['#', 'Officer Name', 'Email Address', 'Role', 'Office / Division', 'ID', 'Status']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [21, 128, 61],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2.5,
        textColor: [30, 41, 59]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        1: { fontStyle: 'bold', cellWidth: 40 },
        2: { cellWidth: 46 },
        3: { cellWidth: 20 },
        4: { cellWidth: 40 },
        5: { halign: 'center', cellWidth: 16 },
        6: { halign: 'center', cellWidth: 16 }
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      }
    });

    doc.save(`User_Accounts_${Date.now()}.pdf`);
    return true;
  }

  return false;
}

/**
 * 4. General Database Items/Documents Report
 * Generates pure table only (No letterhead / extra metadata)
 */
export function generateItemsReport(format, {
  items = [],
}) {
  if (format === 'excel') {
    const wb = XLSX.utils.book_new();

    const data = [
      ['#', 'Document Title', 'Description', 'Created Date', 'Record ID'],
      ...items.map((it, idx) => [
        idx + 1,
        it.title || '',
        it.description || '',
        it.createdAt ? new Date(it.createdAt).toLocaleDateString('en-GB') : 'N/A',
        it._id || ''
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [
      { wch: 5 },
      { wch: 32 },
      { wch: 45 },
      { wch: 18 },
      { wch: 28 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Documents');
    XLSX.writeFile(wb, `Database_Documents_${Date.now()}.xlsx`);
    return true;
  }

  if (format === 'pdf') {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const tableBody = items.map((it, idx) => [
      idx + 1,
      it.title || '',
      it.description || '-',
      it.createdAt ? new Date(it.createdAt).toLocaleDateString('en-GB') : '-'
    ]);

    autoTable(doc, {
      startY: 12,
      head: [['#', 'Title / Item Name', 'Description', 'Date']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [21, 128, 61],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        textColor: [30, 41, 59]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { fontStyle: 'bold', cellWidth: 55 },
        2: { cellWidth: 90 },
        3: { halign: 'center', cellWidth: 25 }
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      }
    });

    doc.save(`Database_Documents_${Date.now()}.pdf`);
    return true;
  }

  return false;
}
