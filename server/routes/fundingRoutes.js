import express from 'express';
import {
  getFundingSources,
  getFundingSourceById,
  createFundingSource,
  updateFundingSource,
  deleteFundingSource,
} from '../controllers/fundingController.js';
import {
  getFundRecords,
  createFundRecord,
  updateFundRecord,
  deleteFundRecord,
} from '../controllers/fundRecordController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Allow public/authenticated read
router.get('/', getFundingSources);
router.get('/:id', getFundingSourceById);

// Fund Activity Records (Progress according to utilized funds)
router.get('/:code/records', getFundRecords);
router.post('/:code/records', protect, createFundRecord);
router.put('/records/:id', protect, updateFundRecord);
router.delete('/records/:id', protect, deleteFundRecord);

// Actions for funding sources (Accessible to logged-in educational officers)
router.post('/', protect, createFundingSource);
router.put('/:id', protect, updateFundingSource);
router.delete('/:id', protect, deleteFundingSource);

export default router;
