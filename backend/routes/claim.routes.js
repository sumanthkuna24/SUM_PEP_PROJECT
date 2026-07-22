const express = require('express');
const router = express.Router();
const {
  sendClaim,
  getReceivedClaims,
  getSentClaims,
  updateClaimStatus
} = require('../controllers/claim.controller');
const { protect } = require('../middleware/auth.middleware');

// Protect all claim routes
router.use(protect);

router.post('/', sendClaim);
router.get('/received', getReceivedClaims);
router.get('/sent', getSentClaims);
router.put('/:id', updateClaimStatus);

module.exports = router;
