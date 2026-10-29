import express from 'express';
import {
  getAllUsers,
  updateUserStatus,
  deleteUser,
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// All user management routes are restricted to authenticated Admins
router.use(protect);
router.use(adminOnly);

router.route('/').get(getAllUsers);
router.route('/:id/status').put(updateUserStatus);
router.route('/:id').delete(deleteUser);

export default router;
