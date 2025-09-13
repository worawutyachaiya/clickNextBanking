const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { User, Transaction } = require('../models');
const { sequelize } = require('../config/database');

const router = express.Router();

// Validation rules
const transactionValidation = [
  body('type')
    .isIn(['deposit', 'withdraw'])
    .withMessage('Transaction type must be either deposit or withdraw'),
  body('amount')
    .isFloat({ min: 0.01, max: 100000 })
    .withMessage('Amount must be between 0.01 and 100,000'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
];

// GET /api/transactions - Get user's transactions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const transactions = await Transaction.findAndCountAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    res.json({
      transactions: transactions.rows,
      pagination: {
        page,
        limit,
        total: transactions.count,
        totalPages: Math.ceil(transactions.count / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/transactions - Create new transaction
router.post('/', authenticateToken, transactionValidation, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { type, amount, description } = req.body;
    const userId = req.user.id;

    // Get current user with lock to prevent race conditions
    const user = await User.findByPk(userId, { 
      lock: true,
      transaction 
    });

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: 'User not found' });
    }

    const transactionAmount = parseFloat(amount);
    let newBalance = parseFloat(user.balance);

    // Calculate new balance based on transaction type
    if (type === 'deposit') {
      newBalance += transactionAmount;
    } else if (type === 'withdraw') {
      if (newBalance < transactionAmount) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Insufficient balance' });
      }
      newBalance -= transactionAmount;
    }

    // Create transaction record
    const newTransaction = await Transaction.create({
      user_id: userId,
      type,
      amount: transactionAmount,
      description: description || null
    }, { transaction });

    // Update user balance
    await user.update({ balance: newBalance }, { transaction });

    await transaction.commit();

    res.status(201).json({
      message: 'Transaction completed successfully',
      transaction: newTransaction,
      newBalance: newBalance
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/transactions/:id - Update transaction
router.put('/:id', authenticateToken, transactionValidation, async (req, res) => {
  const dbTransaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const transactionId = req.params.id;
    const { type, amount, description } = req.body;
    const userId = req.user.id;

    // Find the transaction
    const existingTransaction = await Transaction.findOne({
      where: { id: transactionId, user_id: userId },
      transaction: dbTransaction,
      lock: true
    });

    if (!existingTransaction) {
      await dbTransaction.rollback();
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Get user with lock
    const user = await User.findByPk(userId, { 
      lock: true,
      transaction: dbTransaction 
    });

    // Reverse the old transaction from balance
    let newBalance = parseFloat(user.balance);
    if (existingTransaction.type === 'deposit') {
      newBalance -= parseFloat(existingTransaction.amount);
    } else {
      newBalance += parseFloat(existingTransaction.amount);
    }

    // Apply the new transaction
    const newAmount = parseFloat(amount);
    if (type === 'deposit') {
      newBalance += newAmount;
    } else if (type === 'withdraw') {
      if (newBalance < newAmount) {
        await dbTransaction.rollback();
        return res.status(400).json({ error: 'Insufficient balance for this transaction' });
      }
      newBalance -= newAmount;
    }

    // Update transaction
    await existingTransaction.update({
      type,
      amount: newAmount,
      description: description || null
    }, { transaction: dbTransaction });

    // Update user balance
    await user.update({ balance: newBalance }, { transaction: dbTransaction });

    await dbTransaction.commit();

    res.json({
      message: 'Transaction updated successfully',
      transaction: existingTransaction,
      newBalance: newBalance
    });
  } catch (error) {
    await dbTransaction.rollback();
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/transactions/:id - Delete transaction
router.delete('/:id', authenticateToken, async (req, res) => {
  const dbTransaction = await sequelize.transaction();
  
  try {
    const transactionId = req.params.id;
    const userId = req.user.id;

    // Find the transaction
    const existingTransaction = await Transaction.findOne({
      where: { id: transactionId, user_id: userId },
      transaction: dbTransaction,
      lock: true
    });

    if (!existingTransaction) {
      await dbTransaction.rollback();
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Get user with lock
    const user = await User.findByPk(userId, { 
      lock: true,
      transaction: dbTransaction 
    });

    // Reverse the transaction from balance
    let newBalance = parseFloat(user.balance);
    if (existingTransaction.type === 'deposit') {
      newBalance -= parseFloat(existingTransaction.amount);
    } else {
      newBalance += parseFloat(existingTransaction.amount);
    }

    // Check if balance would be negative
    if (newBalance < 0) {
      await dbTransaction.rollback();
      return res.status(400).json({ error: 'Cannot delete transaction: would result in negative balance' });
    }

    // Delete transaction
    await existingTransaction.destroy({ transaction: dbTransaction });

    // Update user balance
    await user.update({ balance: newBalance }, { transaction: dbTransaction });

    await dbTransaction.commit();

    res.json({
      message: 'Transaction deleted successfully',
      newBalance: newBalance
    });
  } catch (error) {
    await dbTransaction.rollback();
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;