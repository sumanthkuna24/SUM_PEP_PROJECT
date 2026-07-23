const Item = require('../models/item.model');
const { findMatches } = require('../services/matching.service');

// @desc    Create a new item (Lost/Found)
// @route   POST /api/items
// @access  Private
const createItem = async (req, res) => {
  try {
    const { title, description, category, itemType, location, date } = req.body;

    if (!title || !description || !category || !itemType || !location || !date) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const imagePath = req.file ? '/uploads/' + req.file.filename : '';

    const item = new Item({
      title,
      description,
      category,
      itemType,
      location,
      date,
      image: imagePath,
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
    const { search, category, itemType } = req.query;
    const query = { status: 'Open' };

    if (category) {
      query.category = category;
    }

    if (itemType) {
      query.itemType = itemType;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Item.find(query).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching open items:', error);
    res.status(500).json({ message: 'Server error fetching open items' });
  }
};

// @desc    Get complete details of a single item
// @route   GET /api/items/:id
// @access  Private
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    console.error('Error fetching item details:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).json({ message: 'Server error fetching item details' });
  }
};

// @desc    Update an item (owner only)
// @route   PUT /api/items/:id
// @access  Private
const updateItem = async (req, res) => {
  try {
    const { title, description, category, itemType, location, date } = req.body;

    // Validate fields
    if (!title || !description || !category || !itemType || !location || !date) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    let item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Verify ownership
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    // Update allowable fields
    item.title = title;
    item.description = description;
    item.category = category;
    item.itemType = itemType;
    item.location = location;
    item.date = date;

    if (req.file) {
      item.image = '/uploads/' + req.file.filename;
    }

    const updatedItem = await item.save();
    res.status(200).json({ message: 'Item updated successfully', item: updatedItem });
  } catch (error) {
    console.error('Error updating item:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).json({ message: 'Server error updating item' });
  }
};

// @desc    Delete an item (owner only)
// @route   DELETE /api/items/:id
// @access  Private
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Verify ownership
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await item.deleteOne();
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).json({ message: 'Server error deleting item' });
  }
};

// @desc    Get matching suggestions for a specific item
// @route   GET /api/items/:id/suggestions
// @access  Private
const getItemSuggestions = async (req, res) => {
  try {
    const targetItem = await Item.findById(req.params.id);
    if (!targetItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Resolved or Awaiting Handover items do not generate recommendations
    if (targetItem.status !== 'Open') {
      return res.status(200).json({
        item: targetItem,
        suggestions: []
      });
    }

    // Determine opposite item type to compare against
    const oppositeType = targetItem.itemType === 'Lost' ? 'Found' : 'Lost';

    // Find candidate open items of opposite type
    const candidateItems = await Item.find({
      itemType: oppositeType,
      status: 'Open',
      _id: { $ne: targetItem._id }
    });

    // Run matching algorithm with threshold 70
    const suggestions = findMatches(targetItem, candidateItems, 70);

    res.status(200).json({
      item: targetItem,
      suggestions
    });
  } catch (error) {
    console.error('Error fetching item suggestions:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).json({ message: 'Server error fetching item suggestions' });
  }
};

// @desc    Mark an item as resolved (handover completed - owner only)
// @route   PUT /api/items/:id/resolve
// @access  Private
const resolveItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Verify ownership
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to resolve this item' });
    }

    // Ensure item is in Awaiting Handover status
    if (item.status !== 'Awaiting Handover') {
      return res.status(400).json({ message: 'Only items in Awaiting Handover status can be marked as resolved' });
    }

    item.status = 'Resolved';
    const updatedItem = await item.save();

    res.status(200).json({ message: 'Item resolved successfully', item: updatedItem });
  } catch (error) {
    console.error('Error resolving item:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).json({ message: 'Server error resolving item' });
  }
};

module.exports = {
  createItem,
  getMyItems,
  getAllOpenItems,
  getItemById,
  updateItem,
  deleteItem,
  getItemSuggestions,
  resolveItem
};
