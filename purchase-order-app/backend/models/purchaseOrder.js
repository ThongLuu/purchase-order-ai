const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const PurchaseOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  supplier: {
    name: {
      type: String,
      required: true,
    },
    contactInfo: String,
  },
  items: [
    {
      description: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  deliveryDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'shipped', 'delivered'],
    default: 'pending',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  receivedItems: [
    {
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      receivedQuantity: {
        type: Number,
        required: true,
      },
      notes: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

PurchaseOrderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const latestOrder = await this.constructor.findOne({}, {}, { sort: { 'orderNumber': -1 } });
    const latestNumber = latestOrder ? parseInt(latestOrder.orderNumber.split('-')[1]) : 0;
    this.orderNumber = `PO-${(latestNumber + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Add the mongoose-paginate-v2 plugin to the schema
PurchaseOrderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema);