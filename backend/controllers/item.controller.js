const Item = require('../models/item.model');

// @desc    Create a new item (Lost/Found)
// @route   POST /api/items
// @access  Private
const createItem = async (req, res) => {
  try {
    const { title, description, category, itemType, location, date } = req.body;

    if (!title || !description || !category || !itemType || !location || !date) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const item = new Item({
      title,
      description,
      category,
      itemType,
      location,
      date,
      owner: req.user._id // bound from the verified JWT via auth middleware
    });

    await item.save();

    res.status(201).json({ message: 'Item created successfully', item });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ message: 'Server error creating item' });
  }
};

// @desc    Get items reported by the logged-in user
// @route   GET /api/items/my-items
// @access  Private
const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching user items:', error);
    res.status(500).json({ message: 'Server error fetching user items' });
  }
};

// @desc    Get all open items (unresolved)
// @route   GET /api/items
// @access  Private
const getAllOpenItems = async (req, res) => {
  try {
    const items = await Item.find({ status: 'Open' }).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching open items:', error);
    res.status(500).json({ message: 'Server error fetching open items' });
  }
};

module.exports = {
  createItem,
  getMyItems,
  getAllOpenItems
};
