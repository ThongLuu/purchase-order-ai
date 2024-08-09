const express = require('express');
const router = express.Router();
const PurchaseOrder = require('../models/purchaseOrder');
const auth = require('../middleware/auth');

// Get all purchase orders
router.get('/', auth, async (req, res) => {
  try {
    const purchaseOrders = await PurchaseOrder.find().populate('createdBy', 'name');
    res.json(purchaseOrders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new purchase order
router.post('/', auth, async (req, res) => {
  const purchaseOrder = new PurchaseOrder({
    ...req.body,
    createdBy: req.user.id
  });
  try {
    const newPurchaseOrder = await purchaseOrder.save();
    res.status(201).json(newPurchaseOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a purchase order
router.patch('/:id', auth, async (req, res) => {
  try {
    const updatedPurchaseOrder = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedPurchaseOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Approve a purchase order
router.patch('/:id/approve', auth, async (req, res) => {
  try {
    if (req.user.role !== 'approver') {
      return res.status(403).json({ message: 'Not authorized to approve purchase orders' });
    }
    const updatedPurchaseOrder = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedBy: req.user.id },
      { new: true }
    );
    res.json(updatedPurchaseOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Mark purchase order as received
router.patch('/:id/receive', auth, async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    purchaseOrder.receivedItems = req.body.receivedItems;
    purchaseOrder.status = 'delivered';
    const updatedPurchaseOrder = await purchaseOrder.save();
    res.json(updatedPurchaseOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a purchase order
router.delete('/:id', auth, async (req, res) => {
  try {
    await PurchaseOrder.findByIdAndDelete(req.params.id);
    res.json({ message: 'Purchase order deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;