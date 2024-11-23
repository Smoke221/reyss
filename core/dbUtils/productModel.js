const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
      required: false,
    },
    uom: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const productModel = mongoose.model("Product", productSchema);

module.exports = { productModel };
