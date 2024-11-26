const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          // required: true,
        },
        quantity: {
          type: Number,
          // required: true,
          min: 1,
        },
        price: {
          type: Number,
          // required: true,
        },
        name: {
          type: String,
          // required: true,
        },
        category: {
          type: String,
          // required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    // deliveryOn: {
    //   type: Date,
    //   required: true,
    // },
    orderType: {
      type: String,
      required: true,
    },
    placedOn: {
      type: Date,
      default: Date.now,
    },
    isDefaultOrder: {
      type: Boolean,
      required: true,
      default: false,
    },
    isDefectOrder: {
      type: Boolean,
      required: true,
      default: false,
    },
    amountPaid: {
      type: Boolean,
      default: false,
    },
    transactionId: {
      type: String,
      required: function () {
        // Make transactionId required only if amountPaid is true
        return this.amountPaid;
      },
    },
  },
  { timestamps: true }
);

const orderModel = mongoose.model("Order", orderSchema);

module.exports = { orderModel };
