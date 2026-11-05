const { supabase } = require('../config/db');
const { ErrorResponse } = require('../middleware/errorHandler');
const { analyzeWithMLService } = require('./fraudController');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const fs = require('fs');

function generateTransactionId() {
  return 'TXN-' + crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 5);
}

/**
 * @desc    Create a new transaction and analyze for fraud
 * @route   POST /api/transactions
 * @access  Private
 */
const createTransaction = async (req, res, next) => {
  try {
    const transactionId = generateTransactionId();

    const txnData = {
      transaction_id: transactionId,
      user_id: req.user.id,
      amount: parseFloat(req.body.amount),
      type: req.body.type,
      location: req.body.location || null,
      country: req.body.country || null,
      currency: req.body.currency || 'USD',
      description: req.body.description || null,
      device_info: req.body.deviceInfo || req.body.device_info || null,
      ip_address: req.body.ipAddress || req.body.ip_address || null,
      payment_method: req.body.paymentMethod || req.body.payment_method || 'other',
      merchant_name: req.body.merchantName || req.body.merchant_name || null,
      merchant_category: req.body.merchantCategory || req.body.merchant_category || null,
      status: 'completed',
    };

    // Insert transaction
    const { data: transaction, error: insertError } = await supabase
      .from('transactions')
      .insert(txnData)
      .select('*')
      .single();

    if (insertError) {
      return next(new ErrorResponse(insertError.message, 400));
    }

    // Analyze for fraud
    try {
      const analysis = await analyzeWithMLService({ ...txnData, amount: txnData.amount });

      // Update transaction with analysis
      const { data: updated } = await supabase
        .from('transactions')
        .update({
          risk_score: analysis.riskScore,
          risk_level: analysis.riskLevel,
          prediction: analysis.prediction,
          is_fraud: analysis.isFraud,
          reasons: analysis.reasons || [],
          analyzed_at: new Date().toISOString(),
        })
        .eq('id', transaction.id)
        .select('*')
        .single();

      // Save prediction
      await supabase.from('fraud_predictions').insert({
        transaction_id: transaction.id,
        model_version: analysis.modelVersion || '1.0.0',
        risk_score: analysis.riskScore,
        risk_level: analysis.riskLevel,
        prediction: analysis.prediction,
        confidence: analysis.confidence || 0,
        features: analysis.features || txnData,
        reasons: analysis.reasons || [],
      });

      // Create fraud alert if risky
      if (analysis.riskLevel === 'MEDIUM' || analysis.riskLevel === 'HIGH') {
        await supabase.from('fraud_alerts').insert({
          transaction_id: transaction.id,
          user_id: req.user.id,
          alert_type: analysis.riskLevel === 'HIGH' ? 'high_risk' : 'medium_risk',
          risk_score: analysis.riskScore,
          risk_level: analysis.riskLevel,
          description: `${analysis.riskLevel} risk transaction: ${txnData.type} of ${txnData.currency} ${txnData.amount}`,
          reasons: analysis.reasons || [],
          status: 'new',
        });
      }

      res.status(201).json({ success: true, data: updated || transaction });
    } catch (analysisError) {
      console.error('Fraud analysis failed:', analysisError.message);
      res.status(201).json({ success: true, data: transaction });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's transactions with filtering
 * @route   GET /api/transactions
 * @access  Private
 */
const getTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('transactions')
      .select('*, users!transactions_user_id_fkey(id, name, email)', { count: 'exact' })
      .eq('user_id', req.user.id);

    if (req.query.type) query = query.eq('type', req.query.type);
    if (req.query.status) query = query.eq('status', req.query.status);
    if (req.query.riskLevel) query = query.eq('risk_level', req.query.riskLevel);
    if (req.query.isFraud !== undefined) query = query.eq('is_fraud', req.query.isFraud === 'true');
    if (req.query.paymentMethod) query = query.eq('payment_method', req.query.paymentMethod);
    if (req.query.startDate) query = query.gte('created_at', req.query.startDate);
    if (req.query.endDate) query = query.lte('created_at', req.query.endDate);
    if (req.query.search) {
      query = query.or(`transaction_id.ilike.%${req.query.search}%,description.ilike.%${req.query.search}%,merchant_name.ilike.%${req.query.search}%`);
    }

    // Sort
    const sortField = req.query.sortBy || 'created_at';
    const sortAsc = req.query.sortOrder === 'asc';
    query = query.order(sortField, { ascending: sortAsc }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) return next(new ErrorResponse(error.message, 400));

    res.status(200).json({
      success: true,
      count: data.length,
      total: count || 0,
      page,
      pages: Math.ceil((count || 0) / limit),
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single transaction
 * @route   GET /api/transactions/:id
 * @access  Private
 */
const getTransaction = async (req, res, next) => {
  try {
    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('*, users!transactions_user_id_fkey(id, name, email)')
      .eq('id', req.params.id)
      .single();

    if (error || !transaction) {
      return next(new ErrorResponse('Transaction not found', 404));
    }

    if (transaction.user_id !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized', 403));
    }

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get transaction statistics
 * @route   GET /api/transactions/stats
 * @access  Private
 */
const getTransactionStats = async (req, res, next) => {
  try {
    let query = supabase.from('transactions').select('amount, risk_level, is_fraud, status, type');

    if (req.user.role !== 'admin') {
      query = query.eq('user_id', req.user.id);
    }

    const { data: txns, error } = await query;

    if (error) return next(new ErrorResponse(error.message, 400));

    const overview = {
      totalTransactions: txns.length,
      totalAmount: txns.reduce((s, t) => s + parseFloat(t.amount || 0), 0),
      avgAmount: txns.length > 0 ? txns.reduce((s, t) => s + parseFloat(t.amount || 0), 0) / txns.length : 0,
      fraudCount: txns.filter((t) => t.is_fraud).length,
      highRiskCount: txns.filter((t) => t.risk_level === 'HIGH').length,
      mediumRiskCount: txns.filter((t) => t.risk_level === 'MEDIUM').length,
      lowRiskCount: txns.filter((t) => t.risk_level === 'LOW').length,
    };

    // Group by type
    const byType = Object.entries(
      txns.reduce((acc, t) => {
        acc[t.type] = acc[t.type] || { count: 0, totalAmount: 0 };
        acc[t.type].count++;
        acc[t.type].totalAmount += parseFloat(t.amount || 0);
        return acc;
      }, {})
    ).map(([_id, vals]) => ({ _id, ...vals }));

    res.status(200).json({
      success: true,
      data: { overview, byType },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all transactions (admin)
 * @route   GET /api/transactions/all
 * @access  Private/Admin
 */
const getAllTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('transactions')
      .select('*, users!transactions_user_id_fkey(id, name, email)', { count: 'exact' });

    if (req.query.type) query = query.eq('type', req.query.type);
    if (req.query.status) query = query.eq('status', req.query.status);
    if (req.query.riskLevel) query = query.eq('risk_level', req.query.riskLevel);
    if (req.query.search) {
      query = query.or(`transaction_id.ilike.%${req.query.search}%,description.ilike.%${req.query.search}%`);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) return next(new ErrorResponse(error.message, 400));

    res.status(200).json({
      success: true,
      count: data.length,
      total: count || 0,
      page,
      pages: Math.ceil((count || 0) / limit),
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export transactions to CSV
 * @route   GET /api/transactions/export/csv
 * @access  Private
 */
const exportTransactions = async (req, res, next) => {
  try {
    let query = supabase.from('transactions').select('*');

    if (req.user.role !== 'admin') query = query.eq('user_id', req.user.id);
    if (req.query.startDate) query = query.gte('created_at', req.query.startDate);
    if (req.query.endDate) query = query.lte('created_at', req.query.endDate);

    query = query.order('created_at', { ascending: false }).limit(1000);

    const { data: transactions, error } = await query;

    if (error) return next(new ErrorResponse(error.message, 400));

    const exportDir = path.join(__dirname, '..', 'exports');
    if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });

    const filename = `transactions_${Date.now()}.csv`;
    const filepath = path.join(exportDir, filename);

    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'transaction_id', title: 'Transaction ID' },
        { id: 'amount', title: 'Amount' },
        { id: 'currency', title: 'Currency' },
        { id: 'type', title: 'Type' },
        { id: 'status', title: 'Status' },
        { id: 'risk_score', title: 'Risk Score' },
        { id: 'risk_level', title: 'Risk Level' },
        { id: 'is_fraud', title: 'Is Fraud' },
        { id: 'location', title: 'Location' },
        { id: 'payment_method', title: 'Payment Method' },
        { id: 'created_at', title: 'Date' },
      ],
    });

    await csvWriter.writeRecords(
      transactions.map((t) => ({
        ...t,
        is_fraud: t.is_fraud ? 'Yes' : 'No',
      }))
    );

    res.download(filepath, filename, () => {
      fs.unlink(filepath, () => {});
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  getTransactionStats,
  getAllTransactions,
  exportTransactions,
};
