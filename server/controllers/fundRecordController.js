import mongoose from 'mongoose';
import FundRecord from '../models/FundRecord.js';

// Pre-seeded records list left empty as requested: topic/headers are kept, sample data removed
export const DEFAULT_CF_RECORDS = [];

// @desc    Get all records for a fund
// @route   GET /api/funding/:code/records
export const getFundRecords = async (req, res, next) => {
  try {
    const rawCode = req.params.code;
    const cleanCode = rawCode.trim().toUpperCase();

    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        isFallback: true,
      });
    }

    let records = await FundRecord.find({ fundCode: cleanCode }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new fund activity record (Admin only)
// @route   POST /api/funding/:code/records
export const createFundRecord = async (req, res, next) => {
  try {
    const cleanCode = req.params.code.trim().toUpperCase();
    const {
      subject,
      date,
      activityNo,
      budgetCode,
      sourceOfFunding,
      allocation,
      expenditure,
      programCount,
      targetCount,
      actualCount,
    } = req.body;

    if (!subject) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject / activity name (විෂය / කාර්යය).',
      });
    }

    const newRecord = await FundRecord.create({
      fundCode: cleanCode,
      subject: subject.trim(),
      date: date ? date.trim() : '',
      activityNo: activityNo ? activityNo.trim() : '',
      budgetCode: budgetCode ? budgetCode.trim() : '552-81-5-0-1409',
      sourceOfFunding: sourceOfFunding || cleanCode,
      allocation: Number(allocation) || 0,
      expenditure: Number(expenditure) || 0,
      programCount: Number(programCount) || 0,
      targetCount: Number(targetCount) || 0,
      actualCount: Number(actualCount) || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Record added successfully.',
      data: newRecord,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a fund activity record (Admin only)
// @route   PUT /api/funding/records/:id
export const updateFundRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await FundRecord.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found.',
      });
    }

    const fields = [
      'subject',
      'date',
      'activityNo',
      'budgetCode',
      'sourceOfFunding',
      'allocation',
      'expenditure',
      'programCount',
      'targetCount',
      'actualCount',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] === 'string') {
          record[field] = req.body[field].trim();
        } else {
          record[field] = Number(req.body[field]) || 0;
        }
      }
    });

    await record.save();

    res.status(200).json({
      success: true,
      message: 'Record updated successfully.',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a fund activity record (Admin only)
// @route   DELETE /api/funding/records/:id
export const deleteFundRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await FundRecord.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found.',
      });
    }

    await FundRecord.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Record deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
