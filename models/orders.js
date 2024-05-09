import mongoose from "mongoose";

//defining schema

const orderItemSchema = new mongoose.Schema({
  itemName: String,
  unitPrice: Number,
  quantity: Number,
  amount: Number,
});

const orderSchema = new mongoose.Schema({
  id: String,
  orderId: String,
  orderDate: Date,
  customerName: String,
  amount: Number,
  items: [orderItemSchema],
});

const Order = mongoose.model("order", orderSchema);
export { Order };
