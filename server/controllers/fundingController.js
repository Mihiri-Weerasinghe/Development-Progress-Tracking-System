import mongoose from 'mongoose';
import FundingSource from '../models/FundingSource.js';

const DEFAULT_FUNDING_SOURCES = [
  {
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

// Helper to determine styling based on hex color
const computeColorStyles = (hexColor = '#0284c7') => {
  return {
    color: hexColor,
    lightBg: `${hexColor}10`, // ~6% opacity
    borderColor: `${hexColor}40`, // ~25% opacity
    textColor: hexColor,
  };
};

// @desc    Get all funding sources (Auto-seed defaults if empty)
// @route   GET /api/funding
export const getFundingSources = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        count: DEFAULT_FUNDING_SOURCES.length,
        data: DEFAULT_FUNDING_SOURCES,
        isFallback: true,
      });
    }

    let funds = await FundingSource.find({}).sort({ createdAt: 1 });

    // Auto-seed defaults if database has no funding sources yet
    if (funds.length === 0) {
      await FundingSource.insertMany(DEFAULT_FUNDING_SOURCES);
      funds = await FundingSource.find({}).sort({ createdAt: 1 });
    } else {
      // Normalize any previously seeded long names to exact concise names
      let modified = false;
      for (const fund of funds) {
        const matchingDefault = DEFAULT_FUNDING_SOURCES.find((d) => d.code === fund.code);
        if (matchingDefault && (fund.name !== matchingDefault.name || fund.fullName !== matchingDefault.name)) {
          fund.name = matchingDefault.name;
          fund.fullName = matchingDefault.name;
          await fund.save();
          modified = true;
        } else if (fund.fullName && fund.fullName.length > 25) {
          fund.fullName = fund.name;
          await fund.save();
          modified = true;
        }
      }
      if (modified) {
        funds = await FundingSource.find({}).sort({ createdAt: 1 });
      }
    }

    const ORDER_MAP = {
      'CF': 1,
      'CF COMPETITION': 2,
      'GEMP': 3,
      'UNICEF': 4,
      'SESIP': 5,
      'OTHER': 6,
    };
    const sortedFunds = [...funds].sort((a, b) => {
      const orderA = ORDER_MAP[a.code?.toUpperCase()] || 99;
      const orderB = ORDER_MAP[b.code?.toUpperCase()] || 99;
      return orderA - orderB;
    });

    res.status(200).json({
      success: true,
      count: sortedFunds.length,
      data: sortedFunds,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single funding source by ID
// @route   GET /api/funding/:id
export const getFundingSourceById = async (req, res, next) => {
  try {
    const fund = await FundingSource.findById(req.params.id);
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: 'Funding source not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: fund,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new funding source (Admin only)
// @route   POST /api/funding
export const createFundingSource = async (req, res, next) => {
  try {
    const {
      code,
      name,
      amount,
      utilized,
      description,
      color,
    } = req.body;

    if (!name || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Fund Name and allocation amount.',
      });
    }

    const cleanName = name.trim();
    const cleanCode = (code || cleanName).trim().toUpperCase();

    // Check if code or name already exists
    const existing = await FundingSource.findOne({
      $or: [{ code: cleanCode }, { name: cleanName }],
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A funding source with name or code "${cleanName}" already exists.`,
      });
    }

    const chosenColor = color || '#0284c7';
    const styles = computeColorStyles(chosenColor);

    const newFund = await FundingSource.create({
      code: cleanCode,
      name: cleanName,
      fullName: cleanName,
      amount: Number(amount) || 0,
      utilized: Number(utilized) || 0,
      description: description ? description.trim() : '',
      color: chosenColor,
      lightBg: styles.lightBg,
      borderColor: styles.borderColor,
      textColor: styles.textColor,
      createdBy: req.user?._id,
    });

    res.status(201).json({
      success: true,
      message: `Funding source "${newFund.name}" created successfully.`,
      data: newFund,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing funding source (Admin only)
// @route   PUT /api/funding/:id
export const updateFundingSource = async (req, res, next) => {
  try {
    const {
      code,
      name,
      amount,
      utilized,
      description,
      color,
      detailSections,
    } = req.body;

    const fund = await FundingSource.findById(req.params.id);
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: 'Funding source not found.',
      });
    }

    if (name) {
      fund.name = name.trim();
      fund.fullName = name.trim();
    }

    if (code) {
      const cleanCode = code.trim().toUpperCase();
      if (cleanCode !== fund.code) {
        const existing = await FundingSource.findOne({ code: cleanCode });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: `A funding source with code "${cleanCode}" already exists.`,
          });
        }
        fund.code = cleanCode;
      }
    } else if (name) {
      fund.code = name.trim().toUpperCase();
    }

    if (amount !== undefined) fund.amount = Number(amount);
    if (utilized !== undefined) fund.utilized = Number(utilized);
    if (description !== undefined) fund.description = description.trim();
    if (detailSections !== undefined) fund.detailSections = detailSections;

    if (color && color !== fund.color) {
      fund.color = color;
      const styles = computeColorStyles(color);
      fund.lightBg = styles.lightBg;
      fund.borderColor = styles.borderColor;
      fund.textColor = styles.textColor;
    }

    await fund.save();

    res.status(200).json({
      success: true,
      message: `Funding source "${fund.name}" updated successfully.`,
      data: fund,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a funding source (Admin only)
// @route   DELETE /api/funding/:id
export const deleteFundingSource = async (req, res, next) => {
  try {
    const fund = await FundingSource.findById(req.params.id);
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: 'Funding source not found.',
      });
    }

    await FundingSource.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Funding source "${fund.name}" has been deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};
