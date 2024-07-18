const express = require('express');
const { Sale } = require('../models');
const authenticateJWT = require('../middleware/authenticateJWT');
const { Op } = require('sequelize');

const router = express.Router();

router.post('/', authenticateJWT, async (req, res) => {
  try {
    console.log('Received sale data:', req.body);
    const { customerName, customerPhone, customerEmail, deviceModel } = req.body;

    if (!customerName || !customerPhone || !customerEmail || !deviceModel) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    console.log('Extracted sale data:', { customerName, customerPhone, customerEmail, deviceModel });
    
    const sale = await Sale.create({
      customerName,
      customerPhone,
      customerEmail,
      deviceModel,
      UserId: req.user.userId
    });
    
    console.log('Sale created:', sale.toJSON());
    res.status(201).json(sale);
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ message: 'Error recording sale', error: error.message });
  }
});

router.get('/', authenticateJWT, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sales = await Sale.findAll({
      where: {
        UserId: req.user.userId,
        createdAt: {
          [Op.gte]: today
        }
      },
      order: [['createdAt', 'DESC']] // Order by creation date, most recent first
    });
    res.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ message: 'Error fetching sales' });
  }
});

module.exports = router;