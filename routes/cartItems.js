const express = require('express');
const router = express.Router();
const CartItem = require('../models/cartItem');
const Product = require('../models/product');

// Get all cart items
router.get('/', async (req, res) => {
  try {
    const cartItems = await CartItem.find().populate('productId');
    const total = cartItems.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);
    res.json({
      items: cartItems,
      total: total
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new cart item
router.post('/', async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    let cartItem = await CartItem.findOne({ productId });

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItem = new CartItem({ productId, quantity });
    }

    await cartItem.save();
    // Populating the productId field to include product details
    cartItem = await CartItem.findById(cartItem._id).populate('productId');
    res.status(201).json({
      _id: cartItem._id,
      productId: {
        _id: cartItem.productId._id,
        name: cartItem.productId.name,
        price: cartItem.productId.price,
        description: cartItem.productId.description,
        __v: cartItem.productId.__v
      },
      quantity: cartItem.quantity,
      __v: cartItem.__v
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a cart item quantity by ID
router.put('/:id', async (req, res) => {
  const { quantity } = req.body;

  try {
    let cartItem = await CartItem.findById(req.params.id);

    if (!cartItem) {
      return res.status(404).json({ message: 'CartItem not found' });
    }

    cartItem.quantity = quantity;
    await cartItem.save();
    cartItem = await CartItem.findById(cartItem._id).populate('productId');
    res.json({
      _id: cartItem._id,
      productId: {
        _id: cartItem.productId._id,
        name: cartItem.productId.name,
        price: cartItem.productId.price,
        description: cartItem.productId.description,
        __v: cartItem.productId.__v
      },
      quantity: cartItem.quantity,
      __v: cartItem.__v
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a cart item by ID
router.delete('/:id', async (req, res) => {
  try {
    const cartItem = await CartItem.findById(req.params.id);

    if (!cartItem) {
      return res.status(404).json({ message: 'CartItem not found' });
    }

    await cartItem.remove();
    res.json({ message: 'CartItem deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
