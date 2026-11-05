const express = require('express');
const router = express.Router();
const { createTransaction, getTransactions, getTransaction, getTransactionStats, getAllTransactions, exportTransactions } = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/auth');
const { transactionValidation } = require('../middleware/validator');

router.use(protect);
router.post('/', transactionValidation, createTransaction);
router.get('/', getTransactions);
router.get('/stats', getTransactionStats);
router.get('/export/csv', exportTransactions);
router.get('/all', authorize('admin'), getAllTransactions);
router.get('/:id', getTransaction);

module.exports = router;

