const Claim = require('../models/claim.model');
const Item = require('../models/item.model');

// @desc    Send a new claim request for an item
// @route   POST /api/claims
// @access  Private
const sendClaim = async (req, res) => {
  try {
    const { itemId, message } = req.body;

    if (!itemId) {
      return res.status(400).json({ message: 'Item ID is required' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user is trying to claim their own item
    if (item.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot submit a claim request for your own item' });
    }

    // Check if user already submitted a pending claim for this item
    const existingClaim = await Claim.findOne({
      item: itemId,
      claimant: req.user._id,
      status: 'Pending'
    });

    if (existingClaim) {
      return res.status(400).json({ message: 'You have already submitted a pending claim request for this item' });
    }

    const claim = new Claim({
      item: itemId,
      claimant: req.user._id,
      owner: item.owner,
      message: message || '',
      status: 'Pending'
    });

    await claim.save();

    res.status(201).json({ message: 'Claim request submitted successfully', claim });
  } catch (error) {
    console.error('Error submitting claim:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).json({ message: 'Server error submitting claim request' });
  }
};

// @desc    Get claims received by the logged-in user (as item owner)
// @route   GET /api/claims/received
// @access  Private
const getReceivedClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ owner: req.user._id })
      .populate('item')
      .populate('claimant', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json(claims);
  } catch (error) {
    console.error('Error fetching received claims:', error);
    res.status(500).json({ message: 'Server error fetching received claims' });
  }
};

// @desc    Get claims sent by the logged-in user (as claimant)
// @route   GET /api/claims/sent
// @access  Private
const getSentClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .populate('item')
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json(claims);
  } catch (error) {
    console.error('Error fetching sent claims:', error);
    res.status(500).json({ message: 'Server error fetching sent claims' });
  }
};

// @desc    Update claim status (Approve/Reject - Item Owner Only)
// @route   PUT /api/claims/:id
// @access  Private
const updateClaimStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Valid status (Approved or Rejected) is required' });
    }

    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim request not found' });
    }

    // Verify item owner authority
    if (claim.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the item owner can update claim request status' });
    }

    claim.status = status;
    await claim.save();

    // If claim is approved, transition item status to 'Awaiting Handover'
    if (status === 'Approved') {
      const item = await Item.findById(claim.item);
      if (item && item.status === 'Open') {
        item.status = 'Awaiting Handover';
        await item.save();
      }
    }

    const updatedClaim = await Claim.findById(claim._id)
      .populate('item')
      .populate('claimant', 'name email phone');

    res.status(200).json({ message: `Claim request ${status.toLowerCase()} successfully`, claim: updatedClaim });
  } catch (error) {
    console.error('Error updating claim status:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Claim request not found' });
    }
    res.status(500).json({ message: 'Server error updating claim status' });
  }
};

module.exports = {
  sendClaim,
  getReceivedClaims,
  getSentClaims,
  updateClaimStatus
};
