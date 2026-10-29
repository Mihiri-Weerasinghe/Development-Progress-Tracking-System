import mongoose from 'mongoose';

const fundingSourceSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please provide funding code (e.g. CF, GEMP)'],
      trim: true,
      uppercase: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide fund name (e.g. CF, CF Competition)'],
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
      default: '',
    },
    amount: {
      type: Number,
      required: [true, 'Please provide allocated amount'],
      min: [0, 'Allocation amount cannot be negative'],
      default: 0,
    },
    utilized: {
      type: Number,
      min: [0, 'Utilized amount cannot be negative'],
      default: 0,
    },
    color: {
      type: String,
      default: '#0284c7',
    },
    lightBg: {
      type: String,
      default: '#f0f9ff',
    },
    borderColor: {
      type: String,
      default: '#bae6fd',
    },
    textColor: {
      type: String,
      default: '#0369a1',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    // Structured sections ready for the specific details the user will provide later
    detailSections: {
      type: Array,
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for remaining balance
fundingSourceSchema.virtual('balance').get(function () {
  return Math.max(0, (this.amount || 0) - (this.utilized || 0));
});

// Virtual for utilization rate
fundingSourceSchema.virtual('utilizationRate').get(function () {
  if (!this.amount || this.amount <= 0) return '0.0%';
  const rate = ((this.utilized || 0) / this.amount) * 100;
  return `${rate.toFixed(1)}%`;
});

const FundingSource = mongoose.model('FundingSource', fundingSourceSchema);

export default FundingSource;
