import mongoose from 'mongoose';

const fundRecordSchema = new mongoose.Schema(
  {
    fundCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Please provide subject or activity name (විෂය / කාර්යය)'],
      trim: true,
    },
    date: {
      type: String,
      default: '',
      trim: true,
    },
    activityNo: {
      type: String,
      default: '',
      trim: true,
    },
    budgetCode: {
      type: String,
      default: '552-81-5-0-1409',
      trim: true,
    },
    sourceOfFunding: {
      type: String,
      default: 'CF',
      trim: true,
    },
    allocation: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    expenditure: {
      type: Number,
      default: 0,
      min: 0,
    },
    programCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    targetCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    actualCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for remaining balance
fundRecordSchema.virtual('balance').get(function () {
  return Math.max(0, (this.allocation || 0) - (this.expenditure || 0));
});

// Virtual for financial progress percentage
fundRecordSchema.virtual('percentage').get(function () {
  if (!this.allocation || this.allocation <= 0) return 0;
  return Number((((this.expenditure || 0) / this.allocation) * 100).toFixed(1));
});

// Virtual for physical participation rate
fundRecordSchema.virtual('participationRate').get(function () {
  if (!this.targetCount || this.targetCount <= 0) return 0;
  return Math.round(((this.actualCount || 0) / this.targetCount) * 100);
});

const FundRecord = mongoose.model('FundRecord', fundRecordSchema);

export default FundRecord;
