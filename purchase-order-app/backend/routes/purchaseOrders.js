const express = require('express');
const router = express.Router();
const PurchaseOrder = require('../models/purchaseOrder');
const auth = require('../middleware/auth');

// Get all purchase orders with pagination, sorting, and filtering
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', status, supplierName } = req.query;
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 },
      populate: { path: 'createdBy', select: 'name' }
    };

    const query = {};
    if (status) query.status = status;
    if (supplierName) query['supplier.name'] = new RegExp(supplierName, 'i');

    const result = await PurchaseOrder.paginate(query, options);

    res.json({
      purchaseOrders: result.docs,
      totalPages: result.totalPages,
      currentPage: result.page,
      totalCount: result.totalDocs
    });
  } catch (err) {
    console.error('Error fetching purchase orders:', err);
    res.status(500).json({ message: 'An error occurred while fetching purchase orders.', error: err.message });
  }
});

// Create a new purchase order
router.post('/', auth, async (req, res) => {
  try {
    // Input validation
    const { purchaseOrderNumber, supplier, items, totalAmount, deliveryDate } = req.body;
    if (!purchaseOrderNumber || !supplier || !supplier.name || !items || !Array.isArray(items) || items.length === 0 || !totalAmount || !deliveryDate) {
      return res.status(400).json({ message: 'Invalid input. Please provide purchaseOrderNumber, supplier.name, items array, totalAmount, and deliveryDate.' });
    }

    // Validate items
    for (const item of items) {
      if (!item.description || !item.quantity || !item.price) {
        return res.status(400).json({ message: 'Invalid item. Each item must have a description, quantity, and price.' });
      }
    }

    const purchaseOrder = new PurchaseOrder({
      purchaseOrderNumber,
      supplier,
      items,
      totalAmount,
      deliveryDate,
      status: 'pending',
      createdBy: req.user.id
    });

    const newPurchaseOrder = await purchaseOrder.save();
    res.status(201).json({
      message: 'Purchase order created successfully',
      purchaseOrder: newPurchaseOrder
    });
  } catch (err) {
    console.error('Error creating purchase order:', err);
    res.status(500).json({ message: 'An error occurred while creating the purchase order.', error: err.message });
  }
});

// Update a purchase order
router.patch('/:id', auth, async (req, res) => {
  try {
    const updatedPurchaseOrder = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedPurchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    res.json(updatedPurchaseOrder);
  } catch (err) {
    console.error('Error updating purchase order:', err);
    res.status(400).json({ message: 'An error occurred while updating the purchase order.', error: err.message });
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
    if (!updatedPurchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    res.json(updatedPurchaseOrder);
  } catch (err) {
    console.error('Error approving purchase order:', err);
    res.status(400).json({ message: 'An error occurred while approving the purchase order.', error: err.message });
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
    console.error('Error marking purchase order as received:', err);
    res.status(400).json({ message: 'An error occurred while marking the purchase order as received.', error: err.message });
  }
});

// Delete a purchase order
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedPurchaseOrder = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!deletedPurchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    res.json({ message: 'Purchase order deleted successfully' });
  } catch (err) {
    console.error('Error deleting purchase order:', err);
    res.status(500).json({ message: 'An error occurred while deleting the purchase order.', error: err.message });
  }
});

module.exports = router;