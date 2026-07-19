const express = require('express');
const router = express.Router();
const { createItem, getMyItems, getAllOpenItems } = require('../controllers/item.controller');
const { protect } = require('../middleware/auth.middleware');

// All item routes are protected
router.use(protect);

router.post('/', createItem);
router.get('/my-items', getMyItems);
router.get('/', getAllOpenItems);

module.exports = router;
