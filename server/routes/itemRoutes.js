import express from 'express';
import {
  getItems,
  createItem,
  deleteItem,
} from '../controllers/itemController.js';

const router = express.Router();

router.route('/')
  .get(getItems)
  .post(createItem);

router.route('/:id')
  .delete(deleteItem);

export default router;
