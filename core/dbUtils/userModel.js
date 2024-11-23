const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phoneNumber: {
      type: String,
      required: false,
      match: /^[0-9]{10}$/,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
    customerId: {
      type: String,
      required: true,
      unique: true,
    },
    route: {
      type: String,
      trim: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    deliveryAddress: {
      type: Object,
      required: false,
    },
    isDiscountAvailable: {
      type: Boolean,
      required: true,
      default: false,
    },
    discount: {
      percentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      validUntil: {
        type: Date,
      },
    },
    defaultOrder: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

const userModel = mongoose.model("User", userSchema);

module.exports = { userModel };
