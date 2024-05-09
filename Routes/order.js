import express from "express";
import { Order } from "../models/orders.js";

const router = express.Router();

//all order
router.get("/", async (req, res) => {
  try {
    // Fetch all orders from the database
    const orders = await Order.find();

    // Return the fetched orders as the response
    res.status(200).json(orders);
  } catch (error) {
    // If an error occurs, return an error response
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add a new order
router.post("/neworder", async (req, res) => {
  try {
    // Validate data - ensure all required fields are present
    const { orderId, orderDate, customerName, items } = req.body;
    if (
      !orderId ||
      !orderDate ||
      !customerName ||
      !items ||
      items.length === 0
    ) {
      return res.status(400).json({ error: "Invalid data provided" });
    }

    // Calculate amount for each item
    items.forEach((item) => {
      item.amount = item.unitPrice * item.quantity;
    });

    // Calculate total amount for the order
    const totalAmount = items.reduce((total, item) => total + item.amount, 0);

    // Create a new order object
    const newOrder = new Order({
      orderId,
      orderDate,
      customerName,
      items, // Include the items array in the new order object
      amount: totalAmount, // Include the total amount of the order
    });

    // Save the order to the database
    const savedOrder = await newOrder.save();

    // Return the saved order as the response
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ error: "Invalid data provided" });
  }
});

//edit order
router.put("/editorder/:id", async (req, res) => {
  try {
    // Extract the order ID from the request parameters
    const orderId = req.params.id;

    // Validate data - ensure all required fields are present
    const { orderDate, customerName, items } = req.body;
    if (!orderDate || !customerName || !items || items.length === 0) {
      return res.status(400).json({ error: "Invalid data provided" });
    }

    // Calculate amount for each item
    items.forEach((item) => {
      item.amount = item.unitPrice * item.quantity;
    });

    // Calculate total amount for the order
    const totalAmount = items.reduce((total, item) => total + item.amount, 0);

    // Update the order in the database
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        orderDate,
        customerName,
        items,
        amount: totalAmount,
      },
      { new: true }
    );

    // If the order is not found, return a 404 response
    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Return the updated order as the response
    res.status(200).json(updatedOrder);
  } catch (error) {
    // If an error occurs, return an error response
    res.status(400).json({ error: "Invalid data provided" });
  }
});

//delete order
router.delete("/deleteorder/:id", async (req, res) => {
  try {
    // Extract the order ID from the request parameters
    const orderId = req.params.id;

    // Find the order in the database by its ID and delete it
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    // If the order is not found, return a 404 response
    if (!deletedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Return a success message as the response
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    // If an error occurs, return an error response
    res.status(500).json({ error: "Internal server error" });
  }
});

export const orderRouter = router;
