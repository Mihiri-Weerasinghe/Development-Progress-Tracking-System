import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  BarChart3,
  Settings,
  LogOut,
  User,
  ChevronRight,
  Download,
  FileText,
  Printer,
  X,
  GraduationCap,
  TrendingUp,
  CheckCircle2,
  ChevronDown,
  DollarSign,
  Building2,
  Calendar,
  Layers,
  Home as HomeIcon,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  AlertCircle,
  ExternalLink,
  PieChart,
  Clock,
  BookOpen,
  Check,
  Search,
} from 'lucide-react';
import OfficeLogo from '../components/OfficeLogo';
import {
  getFundingSources,
  createFundingSource,
  updateFundingSource,
  deleteFundingSource,
  getFundRecords,
  createFundRecord,
  updateFundRecord,
  deleteFundRecord,
} from '../services/api';
import './FundingDashboard.css';

// Default fallback funding sources
const FALLBACK_FUNDING_SOURCES = [
  {
    _id: 'cf',
    code: 'CF',
    name: 'CF',
    fullName: 'CF',
    amount: 7033800,
    utilized: 6496761.67,
    color: '#0284c7',
    lightBg: '#f0f9ff',
    borderColor: '#bae6fd',
    textColor: '#0369a1',
    description: 'පාසල් සංවර්ධන හා ප්‍රතිපාදන කළමනාකරණය.',
  },
  {
    _id: 'cf-comp',
    code: 'CF COMPETITION',
    name: 'CF Competition',
    fullName: 'CF Competition',
    amount: 8750000,
    utilized: 5100000,
    color: '#8b5cf6',
    lightBg: '#faf5ff',
    borderColor: '#e9d5ff',
    textColor: '#7e22ce',
    description: 'තරගකාරී ප්‍රදාන හා විශේෂ ව්‍යාපෘති.',
  },
  {
    _id: 'gemp',
    code: 'GEMP',
    name: 'GEMP',
    fullName: 'GEMP',
    amount: 22300000,
    utilized: 16400000,
    color: '#16a34a',
    lightBg: '#f0fdf4',
    borderColor: '#bbf7d0',
    textColor: '#15803d',
    description: 'සාමාන්‍ය අධ්‍යාපන නවීකරණ ව්‍යාපෘතිය.',
  },
  {
    _id: 'unicef',
    code: 'UNICEF',
    name: 'UNICEF',
    fullName: 'UNICEF',
    amount: 16800000,
    utilized: 12150000,
    color: '#f59e0b',
    lightBg: '#fffbeb',
    borderColor: '#fde68a',
    textColor: '#b45309',
    description: 'ළමා අරමුදල හා සුබසාධන ප්‍රතිපාදන.',
  },
  {
    _id: 'sesip',
    code: 'SESIP',
    name: 'SESIP',
    fullName: 'SESIP',
    amount: 7150000,
    utilized: 4900000,
    color: '#f43f5e',
    lightBg: '#fff1f2',
    borderColor: '#fecdd3',
    textColor: '#be123c',
    description: 'ද්විතීයික අධ්‍යාපන අංශ වැඩිදියුණු කිරීමේ වැඩසටහන.',
  },
  {
    _id: 'other',
    code: 'OTHER',
    name: 'Other',
    fullName: 'Other',
    amount: 4500000,
    utilized: 2800000,
    color: '#0d9488',
    lightBg: '#f0fdfa',
    borderColor: '#99f6e4',
    textColor: '#0f766e',
    description: 'පළාත් සභා හා අනෙකුත් දේශීය ප්‍රතිපාදන.',
  },
];

// Progress sheet records start empty; official topics/columns are retained
const OFFICIAL_CF_RECORDS = [];

const PRESET_COLORS = [
  { hex: '#0284c7', label: 'Sky Blue' },
  { hex: '#16a34a', label: 'Katugastota Green' },
  { hex: '#8b5cf6', label: 'Purple' },
  { hex: '#f59e0b', label: 'Amber' },
  { hex: '#f43f5e', label: 'Rose' },
  { hex: '#0d9488', label: 'Teal' },
  { hex: '#4f46e5', label: 'Indigo' },
];

export default function FundingDashboard({
  currentUser,
  onNavigate,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFunding, setSelectedFunding] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Live Backend Data
  const [rawFunds, setRawFunds] = useState([]);
  const [loadingFunds, setLoadingFunds] = useState(true);

  // Drill-down Detail View State
  const [selectedFundDetail, setSelectedFundDetail] = useState(null);
  const [fundRecords, setFundRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [recordSearch, setRecordSearch] = useState('');

  // Admin Add / Edit Fund Resource Modal
  const [showCrudModal, setShowCrudModal] = useState(false);
  const [editingFund, setEditingFund] = useState(null);
  const [crudFormData, setCrudFormData] = useState({
    name: '',
    amount: '',
    color: '#16a34a',
  });
  const [crudLoading, setCrudLoading] = useState(false);
  const [crudError, setCrudError] = useState('');

  // Admin Add / Edit Record Line Item Modal
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [recordFormData, setRecordFormData] = useState({
    subject: '',
    date: '',
    activityNo: '',
    budgetCode: '552-81-5-0-1409',
    sourceOfFunding: '',
    allocation: '',
    expenditure: '',
    programCount: '',
    targetCount: '',
    actualCount: '',
  });
  const [recordLoading, setRecordLoading] = useState(false);
  const [recordError, setRecordError] = useState('');

  const [toastMessage, setToastMessage] = useState(null);
  const isAdmin = currentUser?.role === 'Admin';

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch Funding Sources from Backend
  const loadFundingData = async () => {
    setLoadingFunds(true);
    try {
      const res = await getFundingSources();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setRawFunds(res.data);
      } else {
        setRawFunds(FALLBACK_FUNDING_SOURCES);
      }
    } catch {
      setRawFunds(FALLBACK_FUNDING_SOURCES);
    } finally {
      setLoadingFunds(false);
    }
  };

  useEffect(() => {
    loadFundingData();
  }, []);

  // Fetch Line Item Records whenever selectedFundDetail changes
  const loadFundRecords = async (fundCode) => {
    if (!fundCode) return;
    setLoadingRecords(true);
    try {
      const res = await getFundRecords(fundCode);
      if (res.success && Array.isArray(res.data)) {
        setFundRecords(res.data);
      } else {
        setFundRecords([]);
      }
    } catch {
      setFundRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    if (selectedFundDetail) {
      const code = selectedFundDetail.code || selectedFundDetail.name;
      loadFundRecords(code);
    }
  }, [selectedFundDetail]);

  // Compute total allocation and individual percentages
  const fundingSources = useMemo(() => {
    const list = rawFunds.length > 0 ? rawFunds : FALLBACK_FUNDING_SOURCES;
    const totalAlloc = list.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    const ORDER_MAP = {
      'CF': 1,
      'CF COMPETITION': 2,
      'GEMP': 3,
      'UNICEF': 4,
      'SESIP': 5,
      'OTHER': 6,
    };

    const sortedList = [...list].sort((a, b) => {
      const codeA = (a.code || a.name || '').trim().toUpperCase();
      const codeB = (b.code || b.name || '').trim().toUpperCase();
      const orderA = ORDER_MAP[codeA] || 99;
      const orderB = ORDER_MAP[codeB] || 99;
      return orderA - orderB;
    });

    return sortedList.map((item) => {
      const amount = Number(item.amount) || 0;
      const utilized = Number(item.utilized) || 0;
      const balance = Math.max(0, amount - utilized);
      const percentVal = totalAlloc > 0 ? (amount / totalAlloc) * 100 : 0;
      const utilRateVal = amount > 0 ? (utilized / amount) * 100 : 0;
      const baseColor = item.color || '#0284c7';

      return {
        ...item,
        id: item._id || item.id,
        amount,
        amountFormatted: `Rs. ${amount.toLocaleString('en-US')}`,
        utilized,
        utilizedFormatted: `Rs. ${utilized.toLocaleString('en-US')}`,
        balance,
        balanceFormatted: `Rs. ${balance.toLocaleString('en-US')}`,
        percentValue: percentVal,
        percentage: `${percentVal.toFixed(1)}%`,
        utilizationRate: `${utilRateVal.toFixed(1)}%`,
        color: baseColor,
        lightBg: item.lightBg || `${baseColor}10`,
        borderColor: item.borderColor || `${baseColor}30`,
        textColor: item.textColor || baseColor,
      };
    });
  }, [rawFunds]);

  const totalAllocation = useMemo(
    () => fundingSources.reduce((sum, item) => sum + item.amount, 0),
    [fundingSources]
  );
  const totalAllocationFormatted = `Rs. ${totalAllocation.toLocaleString('en-US')}`;

  const totalUtilized = useMemo(
    () => fundingSources.reduce((sum, item) => sum + item.utilized, 0),
    [fundingSources]
  );
  const totalUtilizedFormatted = `Rs. ${totalUtilized.toLocaleString('en-US')}`;

  const totalBalance = useMemo(
    () => fundingSources.reduce((sum, item) => sum + item.balance, 0),
    [fundingSources]
  );
  const totalBalanceFormatted = `Rs. ${totalBalance.toLocaleString('en-US')}`;

  const overallRate =
    totalAllocation > 0
      ? ((totalUtilized / totalAllocation) * 100).toFixed(1) + '%'
      : '0.0%';

  // SVG Donut Chart Math
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;
  const donutSlices = fundingSources.map((item) => {
    const fraction = totalAllocation > 0 ? item.amount / totalAllocation : 0;
    const strokeDash = fraction * circumference;
    const strokeOffset = -(accumulatedPercent * circumference);
    accumulatedPercent += fraction;

    return {
      ...item,
      fraction,
      strokeDash,
      strokeOffset,
    };
  });

  // Filter records by search term
  const filteredRecords = useMemo(() => {
    if (!recordSearch.trim()) return fundRecords;
    const q = recordSearch.toLowerCase();
    return fundRecords.filter(
      (r) =>
        r.subject?.toLowerCase().includes(q) ||
        r.activityNo?.toLowerCase().includes(q) ||
        r.budgetCode?.toLowerCase().includes(q) ||
        r.date?.toLowerCase().includes(q)
    );
  }, [fundRecords, recordSearch]);

  // Dynamic Summary Totals matching the sheet
  const sheetTotals = useMemo(() => {
    const totalAlloc = fundRecords.reduce((sum, r) => sum + (Number(r.allocation) || 0), 0);
    const totalExp = fundRecords.reduce((sum, r) => sum + (Number(r.expenditure) || 0), 0);
    const totalBal = Math.max(0, totalAlloc - totalExp);
    const totalProg = fundRecords.reduce((sum, r) => sum + (Number(r.programCount) || 0), 0);
    const totalTarget = fundRecords.reduce((sum, r) => sum + (Number(r.targetCount) || 0), 0);
    const totalActual = fundRecords.reduce((sum, r) => sum + (Number(r.actualCount) || 0), 0);
    const overallFinPercent = totalAlloc > 0 ? ((totalExp / totalAlloc) * 100).toFixed(1) : '0.0';
    const overallPartPercent = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0;

    return {
      allocation: totalAlloc,
      allocationFormatted: `Rs. ${totalAlloc.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      expenditure: totalExp,
      expenditureFormatted: `Rs. ${totalExp.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      balance: totalBal,
      balanceFormatted: `Rs. ${totalBal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      overallFinPercent: `${overallFinPercent}%`,
      programCount: totalProg,
      targetCount: totalTarget.toLocaleString('en-US'),
      actualCount: totalActual.toLocaleString('en-US'),
      overallPartPercent: `${overallPartPercent}%`,
    };
  }, [fundRecords]);

  // Action: Export Main Dashboard Data
  const handleExportData = () => {
    const headers =
      'Funding Source,Total Allocation (LKR),Percentage (%),Utilized (LKR),Balance (LKR),Utilization Rate (%)\n';
    const rows = fundingSources
      .map(
        (f) =>
          `"${f.name}",${f.amount},${f.percentage},${f.utilized},${f.balance},${f.utilizationRate}`
      )
      .join('\n');
    const totalRow = `\n"TOTAL",${totalAllocation},"100.0%",${totalUtilized},${totalBalance},"${overallRate}"`;

    const blob = new Blob([headers + rows + totalRow], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Funding_Overview_Report_ZEO_Katugastota.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 4000);
  };

  // Action: Export Detailed Sheet Data (Matches Photo Columns)
  const handleExportSheetData = () => {
    const fundName = selectedFundDetail?.name || 'CF';
    const title = `"${fundName} - ප්‍රතිපාදන (වියදම් කළ ප්‍රතිපාදන අනුව ප්‍රගතිය)"\n"කටුගස්තොට කලාප අධ්‍යාපන කාර්යාලය • සංවර්ධන අංශය"\n\n`;
    const headers =
      '#,විෂය / කාර්යය,DATE,Activity No,Budget Code,Source Of Funding,Allocation (Rs),Expenditure (Rs),%,Balance (Rs),වැඩසටහන් ගණන,ඉලක්කගත ගණන,සහභාගී වූ ගණන,සහභාගීත්වයේ ප්‍රතිශතය (%)\n';

    const rows = filteredRecords
      .map((r, idx) => {
        const bal = Math.max(0, (r.allocation || 0) - (r.expenditure || 0));
        const finP = r.allocation > 0 ? ((r.expenditure / r.allocation) * 100).toFixed(1) : '-';
        const partP = r.targetCount > 0 ? Math.round((r.actualCount / r.targetCount) * 100) : '-';
        return `${idx + 1},"${r.subject}","${r.date || ''}","${r.activityNo || ''}","${r.budgetCode || ''}","${r.sourceOfFunding || fundName}",${r.allocation || 0},${r.expenditure || 0},${finP},${bal},${r.programCount || 0},${r.targetCount || 0},${r.actualCount || 0},${partP}`;
      })
      .join('\n');

    const totalRow = `\n,"Total / එකතුව",,,,,${sheetTotals.allocation},${sheetTotals.expenditure},${sheetTotals.overallFinPercent},${sheetTotals.balance},${sheetTotals.programCount},${sheetTotals.targetCount},${sheetTotals.actualCount},${sheetTotals.overallPartPercent}`;

    const blob = new Blob([title + headers + rows + totalRow], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fundName}_Progress_Provisions_Sheet_Katugastota.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Progress Sheet exported as CSV successfully!`);
  };

  const handleOpenDetails = (funding = null) => {
    setSelectedFunding(funding);
    setShowDetailModal(true);
  };

  // Open Fund Add Modal
  const handleOpenAddModal = () => {
    setEditingFund(null);
    setCrudFormData({
      name: '',
      amount: '',
      color: '#16a34a',
    });
    setCrudError('');
    setShowCrudModal(true);
  };

  // Open Fund Edit Modal
  const handleOpenEditModal = (fund, e) => {
    if (e) e.stopPropagation();
    setEditingFund(fund);
    setCrudFormData({
      name: fund.name || '',
      amount: fund.amount || '',
      color: fund.color || '#16a34a',
    });
    setCrudError('');
    setShowCrudModal(true);
  };

  // Delete Fund
  const handleDeleteFund = async (fund, e) => {
    if (e) e.stopPropagation();
    if (
      !window.confirm(
        `Are you sure you want to delete the funding source "${fund.name}"?`
      )
    ) {
      return;
    }

    try {
      if (fund._id) {
        await deleteFundingSource(fund._id);
      }
      setRawFunds((prev) => prev.filter((item) => (item._id || item.id) !== fund.id));
      if (selectedFundDetail?.id === fund.id) {
        setSelectedFundDetail(null);
      }
      showToast(`Funding source "${fund.name}" deleted successfully.`);
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to delete funding source.',
        'error'
      );
    }
  };

  // Save Fund (Add / Update)
  const handleSaveFund = async (e) => {
    e.preventDefault();
    if (!crudFormData.name.trim()) {
      setCrudError('Please enter Fund Name (e.g. CF, CF Competition, GEMP).');
      return;
    }
    if (!crudFormData.amount || Number(crudFormData.amount) < 0) {
      setCrudError('Please enter a valid positive allocated budget amount.');
      return;
    }

    setCrudLoading(true);
    setCrudError('');

    try {
      const payload = {
        name: crudFormData.name.trim(),
        code: crudFormData.name.trim().toUpperCase(),
        amount: Number(crudFormData.amount),
        utilized: editingFund ? (Number(editingFund.utilized) || 0) : 0,
        description: editingFund?.description || '',
        color: crudFormData.color,
      };

      if (editingFund && editingFund._id) {
        const res = await updateFundingSource(editingFund._id, payload);
        if (res.success) {
          setRawFunds((prev) =>
            prev.map((f) => (f._id === editingFund._id ? res.data : f))
          );
          showToast(`Funding resource "${payload.name}" updated successfully!`);
        }
      } else {
        const res = await createFundingSource(payload);
        if (res.success) {
          setRawFunds((prev) => [...prev, res.data]);
          showToast(`New funding resource "${payload.name}" added successfully!`);
        }
      }

      setShowCrudModal(false);
    } catch (err) {
      setCrudError(
        err.response?.data?.message || 'Operation failed. Please check server connection.'
      );
    } finally {
      setCrudLoading(false);
    }
  };

  // ========================================================
  // LINE ITEM ACTIVITY RECORD CRUD (GOV SHEET)
  // ========================================================
  const handleOpenAddRecordModal = () => {
    setEditingRecord(null);
    setRecordFormData({
      subject: '',
      date: '',
      activityNo: '',
      budgetCode: '552-81-5-0-1409',
      sourceOfFunding: selectedFundDetail?.name || 'CF',
      allocation: '',
      expenditure: '',
      programCount: '',
      targetCount: '',
      actualCount: '',
    });
    setRecordError('');
    setShowRecordModal(true);
  };

  const handleOpenEditRecordModal = (record) => {
    setEditingRecord(record);
    setRecordFormData({
      subject: record.subject || '',
      date: record.date || '',
      activityNo: record.activityNo || '',
      budgetCode: record.budgetCode || '552-81-5-0-1409',
      sourceOfFunding: record.sourceOfFunding || selectedFundDetail?.name || 'CF',
      allocation: record.allocation !== undefined ? record.allocation : '',
      expenditure: record.expenditure !== undefined ? record.expenditure : '',
      programCount: record.programCount !== undefined ? record.programCount : '',
      targetCount: record.targetCount !== undefined ? record.targetCount : '',
      actualCount: record.actualCount !== undefined ? record.actualCount : '',
    });
    setRecordError('');
    setShowRecordModal(true);
  };

  const handleDeleteRecord = async (record) => {
    if (!window.confirm(`Are you sure you want to delete line item: "${record.subject}"?`)) {
      return;
    }
    try {
      if (record._id) {
        await deleteFundRecord(record._id);
      }
      setFundRecords((prev) => prev.filter((r) => (r._id || r.id) !== (record._id || record.id)));
      showToast(`Record "${record.subject}" deleted.`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete record.', 'error');
    }
  };

  const handleSaveRecord = async (e) => {
    e.preventDefault();
    if (!recordFormData.subject.trim()) {
      setRecordError('Please provide Subject / Activity Name (විෂය / කාර්යය).');
      return;
    }
    if (recordFormData.allocation === '' || Number(recordFormData.allocation) < 0) {
      setRecordError('Please provide a valid allocation amount (Rs.).');
      return;
    }

    setRecordLoading(true);
    setRecordError('');

    try {
      const fundCode = (selectedFundDetail?.code || selectedFundDetail?.name || 'CF').toUpperCase();
      const payload = {
        subject: recordFormData.subject.trim(),
        date: recordFormData.date.trim(),
        activityNo: recordFormData.activityNo.trim(),
        budgetCode: recordFormData.budgetCode.trim(),
        sourceOfFunding: recordFormData.sourceOfFunding.trim() || fundCode,
        allocation: Number(recordFormData.allocation) || 0,
        expenditure: Number(recordFormData.expenditure) || 0,
        programCount: Number(recordFormData.programCount) || 0,
        targetCount: Number(recordFormData.targetCount) || 0,
        actualCount: Number(recordFormData.actualCount) || 0,
      };

      if (editingRecord && editingRecord._id) {
        const res = await updateFundRecord(editingRecord._id, payload);
        if (res.success) {
          setFundRecords((prev) =>
            prev.map((r) => (r._id === editingRecord._id ? res.data : r))
          );
          showToast(`Record "${payload.subject}" updated.`);
        }
      } else {
        const res = await createFundRecord(fundCode, payload);
        if (res.success) {
          setFundRecords((prev) => [...prev, res.data]);
          showToast(`Record "${payload.subject}" added.`);
        }
      }

      setShowRecordModal(false);
    } catch (err) {
      setRecordError(err.response?.data?.message || 'Operation failed. Check server connection.');
    } finally {
      setRecordLoading(false);
    }
  };

  return (
    <div className="funding-page-wrapper">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className={`admin-toast-notice toast-${toastMessage.type} animate-fade-in`}>
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Dashboard Card Frame */}
      <div className="funding-dashboard-container">
        {/* Left Sidebar */}
        <aside className="funding-sidebar">
          {/* Header Branding */}
          <div className="sidebar-brand-block">
            <div className="sidebar-logo-icon">
              <GraduationCap size={28} className="logo-icon-svg" />
            </div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-main">
                Education Sector Development Framework and Programme
              </span>
              <span className="sidebar-brand-zone">
                කටුගස්තොට කලාප අධ්‍යාපන කාර්යාලය
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="sidebar-nav">
            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'dashboard' && !selectedFundDetail ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('dashboard');
                setSelectedFundDetail(null);
              }}
            >
              <LayoutDashboard size={19} className="nav-item-icon" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'funding-details' ? 'active' : ''}`}
              onClick={() => handleOpenDetails(null)}
            >
              <FileSpreadsheet size={19} className="nav-item-icon" />
              <span>Funding Table</span>
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setShowReportModal(true)}
            >
              <BarChart3 size={19} className="nav-item-icon" />
              <span>Reports</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                className="sidebar-nav-item"
                onClick={() => onNavigate && onNavigate('admin')}
                style={{ color: '#15803d', fontWeight: 700 }}
              >
                <Settings size={19} className="nav-item-icon" />
                <span>Admin Panel</span>
              </button>
            )}
          </nav>

          {/* Bottom Logout */}
          <div className="sidebar-footer">
            <button
              type="button"
              className="sidebar-logout-btn"
              onClick={onLogout}
              title="Sign out or return to welcome screen"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="funding-main-area">
          {/* Top Bar: Welcome User & Profile */}
          <header className="funding-topbar">
            <div className="topbar-left">
              <h1 className="welcome-user-heading">
                Welcome, {currentUser?.name ? currentUser.name : 'Officer'}
              </h1>
              <p className="welcome-user-subtitle">
                {currentUser?.role || 'Education Officer'} &bull; Development Planning Section
                {isAdmin && <span className="admin-badge-pill" style={{ marginLeft: '0.6rem' }}>Admin</span>}
              </p>
            </div>

            <div className="topbar-right">
              <div
                className="user-profile-dropdown"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                <div className="user-avatar-circle">
                  <User size={20} />
                </div>
                <div className="user-profile-info">
                  <span className="user-profile-name">
                    {currentUser?.name || 'Officer'}
                  </span>
                </div>
                <ChevronDown size={16} className="dropdown-caret" />

                {userDropdownOpen && (
                  <div className="user-dropdown-menu animate-fade-in">
                    <div className="dropdown-header">
                      <strong>{currentUser?.name || 'ZEO Officer'}</strong>
                      <small>{currentUser?.email || currentUser?.phone || 'officer@katugastota.edu.lk'}</small>
                    </div>
                    <div className="dropdown-divider"></div>
                    {isAdmin && (
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={() => onNavigate && onNavigate('admin')}
                      >
                        <Settings size={14} />
                        <span>Admin Panel (Approvals)</span>
                      </button>
                    )}
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => onNavigate && onNavigate('home')}
                    >
                      <Layers size={14} />
                      <span>Items & Progress List</span>
                    </button>
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => onNavigate && onNavigate('welcome')}
                    >
                      <HomeIcon size={14} />
                      <span>Back to Welcome Portal</span>
                    </button>
                    <button
                      type="button"
                      className="dropdown-item text-danger"
                      onClick={onLogout}
                    >
                      <LogOut size={14} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Toast Notification */}
          {exportNotice && (
            <div className="export-toast animate-fade-in">
              <CheckCircle2 size={18} />
              <span>Funding Overview Excel/CSV dataset generated and downloaded!</span>
            </div>
          )}

          {/* ========================================================
              IF A FUND IS CLICKED -> DISPLAY EXACT OFFICIAL GOV SHEET
              ======================================================== */}
          {selectedFundDetail ? (
            <div className="fund-detail-view-container animate-fade-in">
              {/* Back Navigation Bar */}
              <div className="fund-detail-top-nav">
                <button
                  type="button"
                  className="btn-back-to-overview"
                  onClick={() => setSelectedFundDetail(null)}
                >
                  <ArrowLeft size={18} />
                  <span>← Back to Funding Overview (නැවත මුල් පිටුවට)</span>
                </button>

                {isAdmin && (
                  <div style={{ display: 'flex', gap: '0.65rem' }}>
                    <button
                      type="button"
                      className="btn-outline-green"
                      onClick={(e) => handleOpenEditModal(selectedFundDetail, e)}
                    >
                      <Pencil size={15} />
                      <span>Edit Fund Budget</span>
                    </button>
                    <button
                      type="button"
                      className="btn-action-delete"
                      style={{ padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      onClick={(e) => handleDeleteFund(selectedFundDetail, e)}
                    >
                      <Trash2 size={15} />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Top Highlights Summary Bar */}
              <div className="fund-detail-stats-grid">
                <div className="fund-stat-box">
                  <span className="stat-box-label">Total Allocation</span>
                  <span className="stat-box-value">
                    {sheetTotals.allocation > 0 ? sheetTotals.allocationFormatted : selectedFundDetail.amountFormatted}
                  </span>
                  <span className="stat-box-sub">මුළු ප්‍රතිපාදනය</span>
                </div>

                <div className="fund-stat-box">
                  <span className="stat-box-label">Total Expenditure</span>
                  <span className="stat-box-value" style={{ color: selectedFundDetail.color }}>
                    {sheetTotals.allocation > 0 ? sheetTotals.expenditureFormatted : 'Rs. 0.00'}
                  </span>
                  <span className="stat-box-sub">මුළු වියදම</span>
                </div>

                <div className="fund-stat-box">
                  <span className="stat-box-label">Remaining Balance</span>
                  <span className="stat-box-value" style={{ color: '#0369a1' }}>
                    {sheetTotals.allocation > 0 ? sheetTotals.balanceFormatted : selectedFundDetail.amountFormatted}
                  </span>
                  <span className="stat-box-sub">ඉතිරි ශේෂය</span>
                </div>

                <div className="fund-stat-box stat-box-highlight">
                  <span className="stat-box-label">Financial Progress</span>
                  <span className="stat-box-value" style={{ color: selectedFundDetail.color }}>
                    {sheetTotals.allocation > 0 ? sheetTotals.overallFinPercent : '0.0%'}
                  </span>
                  <span className="stat-box-sub">
                    {sheetTotals.targetCount > 0
                      ? `සහභාගීත්වය: ${sheetTotals.actualCount} / ${sheetTotals.targetCount} (${sheetTotals.overallPartPercent})`
                      : 'සහභාගීත්වය: —'}
                  </span>
                </div>
              </div>

              {/* Main Official Government Sheet Card */}
              <div className="gov-sheet-card">
                {/* Sheet Title & Actions Toolbar */}
                <div className="gov-sheet-top-header">
                  <div className="gov-title-block">
                    <h3>
                      {selectedFundDetail.name} - ප්‍රතිපාදන (වියදම් කළ ප්‍රතිපාදන අනුව ප්‍රගතිය)
                    </h3>
                    <p>
                      කටුගස්තොට කලාප අධ්‍යාපන කාර්යාලය &bull; සංවර්ධන අංශය
                    </p>
                  </div>

                  <div className="gov-sheet-actions-bar">
                    {/* Live Search */}
                    <div className="gov-search-input-box">
                      <Search size={15} />
                      <input
                        type="text"
                        placeholder="Search subject, activity no, code..."
                        value={recordSearch}
                        onChange={(e) => setRecordSearch(e.target.value)}
                        className="gov-search-input"
                      />
                    </div>

                    {/* Admin Add Record */}
                    {isAdmin && (
                      <button
                        type="button"
                        className="btn-gov-action btn-gov-primary"
                        onClick={handleOpenAddRecordModal}
                      >
                        <Plus size={15} />
                        <span>+ Add Record (නව පේළියක්)</span>
                      </button>
                    )}

                    {/* Export to Excel */}
                    <button
                      type="button"
                      className="btn-gov-action btn-gov-outline"
                      onClick={handleExportSheetData}
                      title="Export as CSV/Excel"
                    >
                      <Download size={15} />
                      <span>Export Excel</span>
                    </button>

                    {/* Print */}
                    <button
                      type="button"
                      className="btn-gov-action btn-gov-outline"
                      onClick={() => window.print()}
                      title="Print Official Sheet"
                    >
                      <Printer size={15} />
                      <span>Print Sheet</span>
                    </button>
                  </div>
                </div>

                {/* Banner when 'Other' fund is selected */}
                {selectedFundDetail.name.toLowerCase() === 'other' && (
                  <div
                    className="other-fund-placeholder-banner animate-fade-in"
                    style={{
                      margin: '0.75rem 1.25rem 1.25rem',
                      padding: '1rem 1.25rem',
                      backgroundColor: '#f0fdfa',
                      border: '1.5px dashed #14b8a6',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.85rem',
                    }}
                  >
                    <div style={{ color: '#0d9488', marginTop: '2px' }}>
                      <Layers size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#0f766e', marginBottom: '0.25rem' }}>
                        Other (අනෙකුත්) Funding Category Selected
                      </div>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: '#134e4a', lineHeight: 1.5 }}>
                        මෙම අංශය යටතේ ඇතුළත් විය යුතු අනු-කාණ්ඩ (sub-categories) සහ දත්ත ඉදිරියේදී ඔබගේ උපදෙස් අනුව එක් කිරීමට සූදානම් කර ඇත. (Sub-items and specific structures will be configured as you specify).
                      </p>
                    </div>
                  </div>
                )}

                {/* The Exact 13-Column Government Table */}
                <div className="gov-table-wrapper">
                  <table className="gov-official-table">
                    <thead>
                      <tr>
                        <th style={{ width: '35px' }} className="th-center">#</th>
                        <th style={{ minWidth: '170px' }}>විෂය / කාර්යය</th>
                        <th className="th-center">DATE</th>
                        <th className="th-center">Activity No</th>
                        <th className="th-center">Budget Code</th>
                        <th className="th-center">Source Of Funding</th>
                        <th className="th-right">Allocation (Rs)</th>
                        <th className="th-right">Expenditure (Rs)</th>
                        <th className="th-center">%</th>
                        <th className="th-right">Balance</th>
                        <th className="th-center">වැඩසටහන් ගණන</th>
                        <th className="th-right">ඉලක්කගත ගණන</th>
                        <th className="th-right">සහභාගී වූ ගණන</th>
                        <th className="th-center">සහභාගීත්වයේ ප්‍රතිශතය</th>
                        {isAdmin && <th className="th-center">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.length === 0 ? (
                        <tr>
                          <td colSpan={isAdmin ? 15 : 14} style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: '#64748b' }}>
                            {loadingRecords ? (
                              <span>Loading progress records...</span>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
                                <FileSpreadsheet size={34} style={{ color: '#94a3b8', opacity: 0.8 }} />
                                <span style={{ fontSize: '0.96rem', fontWeight: 600, color: '#334155' }}>
                                  ප්‍රගති සටහනේ තවමත් දත්ත ඇතුළත් කර නොමැත (No records found)
                                </span>
                                <span style={{ fontSize: '0.84rem', color: '#64748b' }}>
                                  නව දත්ත වාර්තාවක් හෝ පේළියක් එක් කිරීමට ඉහත &apos;+ Add Record&apos; බොත්තම භාවිතා කරන්න.
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ) : (
                        filteredRecords.map((r, idx) => {
                          const allocation = Number(r.allocation) || 0;
                          const expenditure = Number(r.expenditure) || 0;
                          const balance = Math.max(0, allocation - expenditure);
                          const finPercent =
                            allocation > 0 ? ((expenditure / allocation) * 100).toFixed(1) : '-';
                          const partPercent =
                            r.targetCount > 0 ? Math.round((r.actualCount / r.targetCount) * 100) : '-';

                          return (
                            <tr key={r._id || r.id || idx}>
                              <td className="td-center" style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                {idx + 1}
                              </td>

                              <td className="gov-subject-cell">
                                {r.subject}
                              </td>

                              <td className="td-center" style={{ color: '#64748b' }}>
                                {r.date || '—'}
                              </td>

                              <td className="td-center">
                                <span className="gov-code-badge">{r.activityNo || '—'}</span>
                              </td>

                              <td className="td-center">
                                <span className="gov-code-badge">{r.budgetCode || '552-81-5-0-1409'}</span>
                              </td>

                              <td className="td-center" style={{ fontWeight: 800, color: '#15803d' }}>
                                {r.sourceOfFunding || selectedFundDetail.name}
                              </td>

                              <td className="td-right" style={{ fontWeight: 700 }}>
                                {allocation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>

                              <td className="td-right" style={{ color: expenditure > 0 ? '#0f172a' : '#94a3b8' }}>
                                {expenditure > 0
                                  ? expenditure.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                  : '-'}
                              </td>

                              <td className="td-center">
                                {finPercent !== '-' ? (
                                  <span
                                    className={`gov-percent-pill ${
                                      Number(finPercent) >= 99
                                        ? 'gov-percent-full'
                                        : Number(finPercent) >= 80
                                        ? 'gov-percent-high'
                                        : Number(finPercent) >= 50
                                        ? 'gov-percent-mid'
                                        : 'gov-percent-low'
                                    }`}
                                  >
                                    {finPercent}%
                                  </span>
                                ) : (
                                  '-'
                                )}
                              </td>

                              <td className="td-right" style={{ color: balance > 0 ? '#0369a1' : '#64748b' }}>
                                {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>

                              <td className="td-center">
                                {r.programCount > 0 ? r.programCount : '-'}
                              </td>

                              <td className="td-right">
                                {r.targetCount > 0 ? r.targetCount.toLocaleString('en-US') : '-'}
                              </td>

                              <td className="td-right" style={{ fontWeight: 600 }}>
                                {r.actualCount > 0 ? r.actualCount.toLocaleString('en-US') : '-'}
                              </td>

                              <td className="td-center" style={{ fontWeight: 700 }}>
                                {partPercent !== '-' ? `${partPercent}%` : '-'}
                              </td>

                              {isAdmin && (
                                <td className="td-center">
                                  <div className="record-row-actions">
                                    <button
                                      type="button"
                                      className="btn-row-action edit"
                                      onClick={() => handleOpenEditRecordModal(r)}
                                      title="Edit record"
                                    >
                                      <Pencil size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-row-action delete"
                                      onClick={() => handleDeleteRecord(r)}
                                      title="Delete record"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>

                    {/* Official Total Row (shown when records exist) */}
                    {filteredRecords.length > 0 && (
                      <tfoot>
                        <tr>
                          <th colSpan="6" style={{ textAlign: 'center', fontSize: '0.88rem' }}>
                            එකතුව (Total Allocation & Expenditure)
                          </th>
                          <th className="th-right">{sheetTotals.allocationFormatted.replace('Rs. ', '')}</th>
                          <th className="th-right">{sheetTotals.expenditureFormatted.replace('Rs. ', '')}</th>
                          <th className="th-center">{sheetTotals.overallFinPercent}</th>
                          <th className="th-right">{sheetTotals.balanceFormatted.replace('Rs. ', '')}</th>
                          <th className="th-center">{sheetTotals.programCount}</th>
                          <th className="th-right">{sheetTotals.targetCount}</th>
                          <th className="th-right">{sheetTotals.actualCount}</th>
                          <th className="th-center">{sheetTotals.overallPartPercent}</th>
                          {isAdmin && <th></th>}
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================
               NORMAL FUNDING OVERVIEW DASHBOARD VIEW
               ======================================================== */
            <>
              {/* Section: Funding Overview */}
              <section className="funding-overview-section">
                <div className="section-title-row">
                  <div>
                    <h2 className="section-title">Funding Overview</h2>
                    <span className="section-badge">FY 2026 Active Allocations</span>
                  </div>

                  {isAdmin && (
                    <button
                      type="button"
                      className="btn-add-fund-resource"
                      onClick={handleOpenAddModal}
                      title="Add a new funding source"
                    >
                      <Plus size={16} />
                      <span>+ Add Funding Source (අලුත් Fund එකක්)</span>
                    </button>
                  )}
                </div>

                {/* Funding Cards Grid */}
                <div className="funding-cards-grid">
                  {fundingSources.map((item) => (
                    <div
                      key={item.id}
                      className="funding-card clickable-card"
                      style={{
                        backgroundColor: item.lightBg,
                        borderColor: item.borderColor,
                      }}
                      onClick={() => setSelectedFundDetail(item)}
                      title={`Click to view ${item.name} detailed progress sheet`}
                    >
                      <div className="funding-card-top-row">
                        <span
                          className="funding-source-name"
                          style={{ color: item.textColor }}
                        >
                          {item.name}
                        </span>

                        {isAdmin && (
                          <div className="card-admin-actions">
                            <button
                              type="button"
                              className="card-admin-btn btn-edit"
                              onClick={(e) => handleOpenEditModal(item, e)}
                              title="Edit this Fund"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              type="button"
                              className="card-admin-btn btn-delete"
                              onClick={(e) => handleDeleteFund(item, e)}
                              title="Delete this Fund"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="funding-card-amount">
                        {item.amountFormatted}
                      </div>

                      <div className="funding-card-percent">
                        ({item.percentage})
                      </div>

                      <div className="card-click-hint" style={{ color: item.textColor }}>
                        <span>View Progress Sheet</span>
                        <ChevronRight size={13} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Bottom Section: 2 Columns */}
              <div className="funding-bottom-grid">
                {/* Column 1: Donut Chart & Allocation by Organization */}
                <div className="allocation-card">
                  <div className="allocation-card-header">
                    <h3 className="card-heading">Total Allocation by Organization</h3>
                    <span className="allocation-subtitle">
                      Overall Budget: <strong>{totalAllocationFormatted}</strong>
                    </span>
                  </div>

                  <div className="allocation-content-row">
                    {/* SVG Donut Chart */}
                    <div className="donut-chart-wrapper">
                      <svg
                        className="donut-svg"
                        viewBox="0 0 180 180"
                        width="190"
                        height="190"
                      >
                        <g transform="rotate(-90 90 90)">
                          {donutSlices.map((slice) => (
                            <circle
                              key={slice.id}
                              className="donut-segment"
                              cx="90"
                              cy="90"
                              r={radius}
                              fill="transparent"
                              stroke={slice.color}
                              strokeWidth="28"
                              strokeDasharray={`${slice.strokeDash} ${circumference - slice.strokeDash}`}
                              strokeDashoffset={slice.strokeOffset}
                            />
                          ))}
                        </g>
                        {/* Donut Center Text */}
                        <text
                          x="90"
                          y="83"
                          textAnchor="middle"
                          className="donut-center-label"
                        >
                          Total
                        </text>
                        <text
                          x="90"
                          y="104"
                          textAnchor="middle"
                          className="donut-center-amount"
                        >
                          {totalAllocationFormatted}
                        </text>
                      </svg>
                    </div>

                    {/* Legend List */}
                    <div className="donut-legend-list">
                      {fundingSources.map((item) => (
                        <div
                          key={item.id}
                          className="legend-row"
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelectedFundDetail(item)}
                          title="Click to view details"
                        >
                          <div className="legend-left">
                            <span
                              className="legend-dot"
                              style={{ backgroundColor: item.color }}
                            ></span>
                            <span className="legend-name">{item.name}</span>
                          </div>
                          <div className="legend-right">
                            <span className="legend-percent">{item.percentage}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 2: Quick Actions */}
                <div className="quick-actions-card">
                  <h3 className="card-heading">Quick Actions</h3>

                  <div className="quick-actions-list">
                    {/* Action 1 */}
                    <button
                      type="button"
                      className="quick-action-btn"
                      onClick={() => handleOpenDetails(null)}
                    >
                      <div className="action-btn-left">
                        <div className="action-icon-box">
                          <FileSpreadsheet size={19} className="action-icon-svg" />
                        </div>
                        <span className="action-btn-text">View Funding Table</span>
                      </div>
                      <ChevronRight size={18} className="action-arrow" />
                    </button>

                    {/* Action 2 */}
                    <button
                      type="button"
                      className="quick-action-btn"
                      onClick={() => setShowReportModal(true)}
                    >
                      <div className="action-btn-left">
                        <div className="action-icon-box">
                          <FileText size={19} className="action-icon-svg" />
                        </div>
                        <span className="action-btn-text">Generate Report</span>
                      </div>
                      <ChevronRight size={18} className="action-arrow" />
                    </button>

                    {/* Action 3 */}
                    <button
                      type="button"
                      className="quick-action-btn"
                      onClick={handleExportData}
                    >
                      <div className="action-btn-left">
                        <div className="action-icon-box">
                          <Download size={19} className="action-icon-svg" />
                        </div>
                        <span className="action-btn-text">Export Data (Excel)</span>
                      </div>
                      <ChevronRight size={18} className="action-arrow" />
                    </button>

                    {/* Action 4: If Admin, quick link to user approvals */}
                    {isAdmin && (
                      <button
                        type="button"
                        className="quick-action-btn"
                        onClick={() => onNavigate && onNavigate('admin')}
                      >
                        <div className="action-btn-left">
                          <div className="action-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
                            <Settings size={19} className="action-icon-svg" />
                          </div>
                          <span className="action-btn-text">Manage Officer Approvals</span>
                        </div>
                        <ChevronRight size={18} className="action-arrow" />
                      </button>
                    )}
                  </div>

                  {/* Helpful footer info banner */}
                  <div className="quick-actions-footer-note">
                    <Building2 size={15} />
                    <span>Katugastota Education Zone Funding Portal</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ========================================================
          MODAL: ADD / EDIT LINE ITEM RECORD (GOV PROGRESS SHEET)
          ======================================================== */}
      {showRecordModal && (
        <div className="dashboard-modal-backdrop" onClick={() => setShowRecordModal(false)}>
          <div
            className="dashboard-modal-card crud-modal-card animate-scale-up"
            style={{ maxWidth: '680px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-block">
                <FileSpreadsheet size={22} className="modal-title-icon" />
                <div>
                  <h3 className="modal-title">
                    {editingRecord ? 'Edit Activity Record' : 'Add New Activity Record'}
                  </h3>
                  <p className="modal-subtitle">
                    {selectedFundDetail?.name || 'CF'} - ප්‍රතිපාදන හා ප්‍රගති සටහන
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowRecordModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveRecord}>
              <div className="modal-body">
                {recordError && (
                  <div className="auth-alert alert-error" style={{ marginBottom: '1.25rem' }}>
                    <AlertCircle size={18} />
                    <span>{recordError}</span>
                  </div>
                )}

                <div className="crud-form-grid">
                  <div className="crud-form-group col-span-2">
                    <label className="crud-label">විෂය / කාර්යය (Subject / Activity Name) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ප්‍රාථමික, විද්‍යාව (6-11), සිංහල සාහිත්‍ය"
                      className="crud-input"
                      value={recordFormData.subject}
                      onChange={(e) => setRecordFormData({ ...recordFormData, subject: e.target.value })}
                    />
                  </div>

                  <div className="crud-form-group">
                    <label className="crud-label">Activity No (ක්‍රියාකාරකම් අංකය)</label>
                    <input
                      type="text"
                      placeholder="e.g. 2.2.1, 1.2.1.2"
                      className="crud-input"
                      value={recordFormData.activityNo}
                      onChange={(e) => setRecordFormData({ ...recordFormData, activityNo: e.target.value })}
                    />
                  </div>

                  <div className="crud-form-group">
                    <label className="crud-label">Budget Code (වැය ශීර්ෂය)</label>
                    <input
                      type="text"
                      placeholder="e.g. 552-81-5-0-1409"
                      className="crud-input"
                      value={recordFormData.budgetCode}
                      onChange={(e) => setRecordFormData({ ...recordFormData, budgetCode: e.target.value })}
                    />
                  </div>

                  <div className="crud-form-group">
                    <label className="crud-label">DATE (දිනය - Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 2026/10"
                      className="crud-input"
                      value={recordFormData.date}
                      onChange={(e) => setRecordFormData({ ...recordFormData, date: e.target.value })}
                    />
                  </div>

                  <div className="crud-form-group">
                    <label className="crud-label">Source Of Funding (මුදල් ප්‍රතිපාදනය)</label>
                    <input
                      type="text"
                      placeholder="e.g. CF"
                      className="crud-input"
                      value={recordFormData.sourceOfFunding}
                      onChange={(e) => setRecordFormData({ ...recordFormData, sourceOfFunding: e.target.value })}
                    />
                  </div>

                  <div className="crud-form-group">
                    <label className="crud-label">Allocation / ප්‍රතිපාදනය (Rs.) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      placeholder="e.g. 100000"
                      className="crud-input"
                      value={recordFormData.allocation}
                      onChange={(e) => setRecordFormData({ ...recordFormData, allocation: e.target.value })}
                    />
                  </div>

                  <div className="crud-form-group">
                    <label className="crud-label">Expenditure / වියදම (Rs.)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 99152.55"
                      className="crud-input"
                      value={recordFormData.expenditure}
                      onChange={(e) => setRecordFormData({ ...recordFormData, expenditure: e.target.value })}
                    />
                  </div>

                  <div className="crud-form-group">
                    <label className="crud-label">වැඩසටහන් ගණන (No. of Programmes)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 6"
                      className="crud-input"
                      value={recordFormData.programCount}
                      onChange={(e) => setRecordFormData({ ...recordFormData, programCount: e.target.value })}
                    />
                  </div>

                  <div className="crud-form-group">
                    <label className="crud-label">ඉලක්කගත ගණන (Target Participants)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 363"
                      className="crud-input"
                      value={recordFormData.targetCount}
                      onChange={(e) => setRecordFormData({ ...recordFormData, targetCount: e.target.value })}
                    />
                  </div>

                  <div className="crud-form-group col-span-2">
                    <label className="crud-label">සහභාගී වූ ගණන (Actual Participants)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 350"
                      className="crud-input"
                      value={recordFormData.actualCount}
                      onChange={(e) => setRecordFormData({ ...recordFormData, actualCount: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-outline-green"
                  onClick={() => setShowRecordModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-green"
                  disabled={recordLoading}
                >
                  {recordLoading ? 'Saving...' : editingRecord ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD / EDIT FUNDING RESOURCE (ADMIN ONLY)
          ======================================================== */}
      {showCrudModal && (
        <div className="dashboard-modal-backdrop" onClick={() => setShowCrudModal(false)}>
          <div
            className="dashboard-modal-card crud-modal-card animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-block">
                <DollarSign size={22} className="modal-title-icon" />
                <div>
                  <h3 className="modal-title">
                    {editingFund ? `Edit ${editingFund.name} Resource` : 'Add New Funding Resource'}
                  </h3>
                  <p className="modal-subtitle">
                    Manage financial allocations for Katugastota Education Zone
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowCrudModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveFund}>
              <div className="modal-body">
                {crudError && (
                  <div className="auth-alert alert-error" style={{ marginBottom: '1.25rem' }}>
                    <AlertCircle size={18} />
                    <span>{crudError}</span>
                  </div>
                )}

                <div className="crud-form-grid">
                  <div className="crud-form-group col-span-2">
                    <label className="crud-label">Fund Name * (e.g. CF, CF Competition, GEMP, UNICEF, SESIP, Other)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CF, CF Competition"
                      className="crud-input"
                      value={crudFormData.name}
                      onChange={(e) =>
                        setCrudFormData({ ...crudFormData, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="crud-form-group col-span-2">
                    <label className="crud-label">Total Allocated Amount (LKR) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="e.g. 15000000"
                      className="crud-input"
                      value={crudFormData.amount}
                      onChange={(e) =>
                        setCrudFormData({ ...crudFormData, amount: e.target.value })
                      }
                    />
                  </div>

                  <div className="crud-form-group col-span-2">
                    <label className="crud-label">Card Theme Color</label>
                    <div className="color-presets-row">
                      {PRESET_COLORS.map((c) => (
                        <div
                          key={c.hex}
                          className={`color-preset-pill ${crudFormData.color === c.hex ? 'active' : ''}`}
                          style={{ backgroundColor: c.hex }}
                          title={c.label}
                          onClick={() => setCrudFormData({ ...crudFormData, color: c.hex })}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-outline-green"
                  onClick={() => setShowCrudModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-green"
                  disabled={crudLoading}
                >
                  {crudLoading ? 'Saving...' : editingFund ? 'Update Resource' : 'Create Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Funding Details Breakdown (Table View) */}
      {showDetailModal && (
        <div className="dashboard-modal-backdrop" onClick={() => setShowDetailModal(false)}>
          <div
            className="dashboard-modal-card animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-block">
                <FileSpreadsheet size={22} className="modal-title-icon" />
                <div>
                  <h3 className="modal-title">
                    {selectedFunding ? `${selectedFunding.name} Details` : 'Overview of All Funding Sources'}
                  </h3>
                  <p className="modal-subtitle">
                    Development Sector Financial Allocation Breakdown &bull; Katugastota Zone
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowDetailModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-table-container">
                <table className="funding-table">
                  <thead>
                    <tr>
                      <th>Fund Name</th>
                      <th>Description / Purpose</th>
                      <th>Total Allocated</th>
                      <th>Utilized</th>
                      <th>Balance Available</th>
                      <th>Utilization %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedFunding ? [selectedFunding] : fundingSources).map((f) => (
                      <tr key={f.id}>
                        <td>
                          <span
                            className="source-chip"
                            style={{
                              backgroundColor: f.lightBg,
                              color: f.textColor,
                              borderColor: f.borderColor,
                              fontWeight: 700,
                            }}
                          >
                            {f.name}
                          </span>
                        </td>
                        <td className="source-fullname">
                          <span className="source-desc-small">{f.description || '—'}</span>
                        </td>
                        <td className="table-amount">{f.amountFormatted}</td>
                        <td className="table-utilized">{f.utilizedFormatted}</td>
                        <td className="table-balance">{f.balanceFormatted}</td>
                        <td>
                          <div className="progress-cell">
                            <div className="progress-bar-bg">
                              <div
                                className="progress-bar-fill"
                                style={{
                                  width: f.utilizationRate,
                                  backgroundColor: f.color,
                                }}
                              ></div>
                            </div>
                            <span className="progress-text">{f.utilizationRate}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan="2">Total Financial Allocation</th>
                      <th>{totalAllocationFormatted}</th>
                      <th>{totalUtilizedFormatted}</th>
                      <th>{totalBalanceFormatted}</th>
                      <th>{overallRate}</th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-outline-green"
                onClick={handleExportData}
              >
                <Download size={16} />
                <span>Export to Excel</span>
              </button>
              <button
                type="button"
                className="btn-primary-green"
                onClick={() => setShowDetailModal(false)}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Generate Official Report */}
      {showReportModal && (
        <div className="dashboard-modal-backdrop" onClick={() => setShowReportModal(false)}>
          <div
            className="dashboard-modal-card report-modal-card animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-block">
                <FileText size={22} className="modal-title-icon" />
                <div>
                  <h3 className="modal-title">Official Funding Report Summary</h3>
                  <p className="modal-subtitle">
                    Education Sector Development Framework and Programme
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowReportModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body report-printable">
              {/* Report Letterhead */}
              <div className="report-letterhead">
                <OfficeLogo size={60} rounded={false} />
                <div className="report-letterhead-text">
                  <h4>ZONAL EDUCATION OFFICE - KATUGASTOTA</h4>
                  <h5>කටුගස්තොට කලාප අධ්‍යාපන කාර්යාලය</h5>
                  <p>Development Progress Tracking System &bull; Financial Division</p>
                </div>
              </div>

              <div className="report-meta-grid">
                <div className="meta-box">
                  <span className="meta-label">Report Document:</span>
                  <strong className="meta-val">Overview of Funding Sources (Summary)</strong>
                </div>
                <div className="meta-box">
                  <span className="meta-label">Generated Date:</span>
                  <strong className="meta-val">
                    {new Date().toLocaleDateString('en-GB')}
                  </strong>
                </div>
                <div className="meta-box">
                  <span className="meta-label">Prepared For:</span>
                  <strong className="meta-val">Zonal Director & Development Section</strong>
                </div>
                <div className="meta-box">
                  <span className="meta-label">Officer In Charge:</span>
                  <strong className="meta-val">{currentUser?.name || 'Authorized Officer'}</strong>
                </div>
              </div>

              {/* Summary Highlights */}
              <div className="report-summary-boxes">
                <div className="report-stat-box">
                  <span className="stat-label">Total Allocated</span>
                  <span className="stat-number">{totalAllocationFormatted}</span>
                  <span className="stat-sub">Across {fundingSources.length} Active Programmes</span>
                </div>
                <div className="report-stat-box">
                  <span className="stat-label">Total Disbursed</span>
                  <span className="stat-number">{totalUtilizedFormatted}</span>
                  <span className="stat-sub">Overall {overallRate} progress</span>
                </div>
                <div className="report-stat-box">
                  <span className="stat-label">Unallocated / Reserve</span>
                  <span className="stat-number">{totalBalanceFormatted}</span>
                  <span className="stat-sub">Available for upcoming targets</span>
                </div>
              </div>

              <h4 className="report-table-heading">Programme Allocation Breakdown</h4>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Programme</th>
                    <th>Share (%)</th>
                    <th>Allocation (LKR)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fundingSources.map((f) => (
                    <tr key={f.id}>
                      <td>
                        <strong>{f.name}</strong>
                      </td>
                      <td>{f.percentage}</td>
                      <td>{f.amountFormatted}</td>
                      <td>
                        <span className="badge-active">On Track</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-outline-green"
                onClick={() => window.print()}
              >
                <Printer size={16} />
                <span>Print Report</span>
              </button>
              <button
                type="button"
                className="btn-outline-green"
                onClick={handleExportData}
              >
                <Download size={16} />
                <span>Export CSV/Excel</span>
              </button>
              <button
                type="button"
                className="btn-primary-green"
                onClick={() => setShowReportModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
