import mongoose from 'mongoose';
import Item from '../models/Item.js';

// @desc    Get all items
// @route   GET /api/items
export const getItems = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB is not connected. Please check your connection string in server/.env',
        data: [],
      });
    }

    const items = await Item.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new item
// @route   POST /api/items
export const createItem = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB is not connected. Please check your connection string in server/.env',
      });
    }

    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const newItem = await Item.create({ title, description });
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an item
// @route   DELETE /api/items/:id
export const deleteItem = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB is not connected.',
      });
    }

    const { id } = req.params;
    const item = await Item.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.status(200).json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    next(error);
  }
};
