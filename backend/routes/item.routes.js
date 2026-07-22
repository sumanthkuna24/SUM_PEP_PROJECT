const express = require('express');
const router = express.Router();
const { createItem, getMyItems, getAllOpenItems, getItemById, updateItem, deleteItem, getItemSuggestions } = require('../controllers/item.controller');
const { protect } = require('../middleware/auth.middleware');
const { handleImageUpload } = require('../middleware/upload.middleware');

// All item routes are protected
router.use(protect);

router.post('/', handleImageUpload, createItem);
router.get('/my-items', getMyItems);
router.get('/', getAllOpenItems);
router.get('/:id/suggestions', getItemSuggestions);
router.get('/:id', getItemById);
router.put('/:id', handleImageUpload, updateItem);
router.delete('/:id', deleteItem);

module.exports = router;
