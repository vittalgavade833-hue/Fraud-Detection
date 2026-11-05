const axios = require('axios');
const { supabase } = require('../config/db');
const { ErrorResponse } = require('../middleware/errorHandler');

/**
 * Rule-based fallback fraud scoring when ML service is unavailable
 */
const ruleBasedScoring = (txnData) => {
  let score = 0;
  const reasons = [];

  if (txnData.amount > 10000) {
    score += 30;
    reasons.push('High transaction amount (>$10,000)');
  } else if (txnData.amount > 5000) {
    score += 15;
    reasons.push('Elevated transaction amount (>$5,000)');
  }

  if (['withdrawal', 'transfer'].includes(txnData.type)) {
    score += 10;
    reasons.push(`Transaction type '${txnData.type}' carries higher risk`);
  }

  if (txnData.payment_method === 'crypto' || txnData.paymentMethod === 'crypto') {
    score += 15;
    reasons.push('Cryptocurrency payment method');
  }

  if (txnData.country && txnData.country !== 'US' && txnData.country !== 'United States') {
    score += 10;
    reasons.push('International transaction detected');
  }

  const hour = new Date().getHours();
  if (hour >= 0 && hour < 6) {
    score += 10;
    reasons.push('Transaction made during unusual hours (midnight-6AM)');
  }

  if (!txnData.location) {
    score += 5;
    reasons.push('Location information missing');
  }

  score = Math.min(score, 100);

  let riskLevel;
  if (score >= 70) riskLevel = 'HIGH';
  else if (score >= 40) riskLevel = 'MEDIUM';
  else riskLevel = 'LOW';

  return {
    riskScore: score,
    riskLevel,
    prediction: riskLevel === 'HIGH' ? 'Potential Fraud' : riskLevel === 'MEDIUM' ? 'Suspicious Transaction' : 'Normal Transaction',
    isFraud: score >= 70,
    confidence: 0.6,
    reasons,
    modelVersion: 'rule-based-v1',
    features: txnData,
  };
};

/**
 * Analyze transaction with ML service, fallback to rules
 */
const analyzeWithMLService = async (txnData) => {
  try {
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';

    const payload = {
      amount: txnData.amount,
      type: txnData.type,
      location: txnData.location || '',
      country: txnData.country || '',
      currency: txnData.currency || 'USD',
      paymentMethod: txnData.payment_method || txnData.paymentMethod || 'other',
      merchantName: txnData.merchant_name || txnData.merchantName || '',
      merchantCategory: txnData.merchant_category || txnData.merchantCategory || '',
      deviceInfo: txnData.device_info || txnData.deviceInfo || '',
      ipAddress: txnData.ip_address || txnData.ipAddress || '',
    };

    const response = await axios.post(`${mlServiceUrl}/api/fraud/analyze`, payload, { timeout: 5000 });
    const data = response.data;

    return {
      riskScore: data.riskScore ?? data.risk_score ?? 0,
      riskLevel: data.riskLevel ?? data.risk_level ?? 'LOW',
      prediction: data.prediction ?? 'Normal Transaction',
      isFraud: (data.riskScore ?? data.risk_score ?? 0) >= 70,
      confidence: data.confidence ?? 0,
      reasons: data.reasons ?? [],
      modelVersion: data.modelVersion ?? data.model_version ?? '1.0.0',
      features: payload,
    };
  } catch (error) {
    console.warn('ML service unavailable, using rule-based scoring:', error.message);
    return ruleBasedScoring(txnData);
  }
};

/**
 * @desc    Analyze a transaction for fraud
 * @route   POST /api/fraud/analyze
 * @access  Private
 */
const analyzeTransaction = async (req, res, next) => {
  try {
    const analysis = await analyzeWithMLService(req.body);

    res.status(200).json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get fraud alerts
 * @route   GET /api/fraud/alerts
 * @access  Private
 */
const getAlerts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('fraud_alerts')
      .select('*, transactions(*), users!fraud_alerts_user_id_fkey(id, name, email)', { count: 'exact' });

    // Users see own, admins see all
    if (req.user.role !== 'admin') {
      query = query.eq('user_id', req.user.id);
    }

    if (req.query.status) query = query.eq('status', req.query.status);
    if (req.query.riskLevel) query = query.eq('risk_level', req.query.riskLevel);
    if (req.query.alertType) query = query.eq('alert_type', req.query.alertType);

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: alerts, error, count } = await query;

    if (error) return next(new ErrorResponse(error.message, 400));

    res.status(200).json({
      success: true,
      count: alerts.length,
      total: count || 0,
      page,
      pages: Math.ceil((count || 0) / limit),
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single alert
 * @route   GET /api/fraud/alerts/:id
 * @access  Private
 */
const getAlert = async (req, res, next) => {
  try {
    const { data: alert, error } = await supabase
      .from('fraud_alerts')
      .select('*, transactions(*), users!fraud_alerts_user_id_fkey(id, name, email)')
      .eq('id', req.params.id)
      .single();

    if (error || !alert) return next(new ErrorResponse('Alert not found', 404));

    if (req.user.role !== 'admin' && alert.user_id !== req.user.id) {
      return next(new ErrorResponse('Not authorized to view this alert', 403));
    }

    res.status(200).json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update alert status
 * @route   PUT /api/fraud/alerts/:id
 * @access  Private/Admin
 */
const updateAlertStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const { data: alert, error } = await supabase
      .from('fraud_alerts')
      .update({
        status,
        reviewed_by: req.user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select('*, transactions(*), users!fraud_alerts_user_id_fkey(id, name, email)')
      .single();

    if (error || !alert) return next(new ErrorResponse('Alert not found', 404));

    // Update transaction if confirmed or false positive
    if (status === 'confirmed_fraud') {
      await supabase
        .from('transactions')
        .update({ is_fraud: true, is_reviewed: true })
        .eq('id', alert.transaction_id);
    } else if (status === 'false_positive') {
      await supabase
        .from('transactions')
        .update({ is_fraud: false, is_reviewed: true })
        .eq('id', alert.transaction_id);
    }

    res.status(200).json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add investigation notes
 * @route   POST /api/fraud/alerts/:id/notes
 * @access  Private/Admin
 */
const addInvestigationNote = async (req, res, next) => {
  try {
    const { notes } = req.body;

    // Get existing alert
    const { data: existing } = await supabase
      .from('fraud_alerts')
      .select('investigation_notes, status')
      .eq('id', req.params.id)
      .single();

    if (!existing) return next(new ErrorResponse('Alert not found', 404));

    const timestamp = new Date().toISOString();
    const noteEntry = `[${timestamp}] ${req.user.name}: ${notes}`;
    const newNotes = existing.investigation_notes
      ? `${existing.investigation_notes}\n${noteEntry}`
      : noteEntry;

    const updates = { investigation_notes: newNotes };
    if (existing.status === 'new') updates.status = 'investigating';

    const { data: alert, error } = await supabase
      .from('fraud_alerts')
      .update(updates)
      .eq('id', req.params.id)
      .select('*, transactions(*), users!fraud_alerts_user_id_fkey(id, name, email)')
      .single();

    if (error) return next(new ErrorResponse(error.message, 400));

    res.status(200).json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get alert statistics
 * @route   GET /api/fraud/alerts/stats
 * @access  Private
 */
const getAlertStats = async (req, res, next) => {
  try {
    let query = supabase.from('fraud_alerts').select('status, risk_level, risk_score');

    if (req.user.role !== 'admin') {
      query = query.eq('user_id', req.user.id);
    }

    const { data: alerts, error } = await query;

    if (error) return next(new ErrorResponse(error.message, 400));

    const stats = {
      totalAlerts: alerts.length,
      newAlerts: alerts.filter((a) => a.status === 'new').length,
      reviewedAlerts: alerts.filter((a) => a.status === 'reviewed').length,
      confirmedFraud: alerts.filter((a) => a.status === 'confirmed_fraud').length,
      falsePositives: alerts.filter((a) => a.status === 'false_positive').length,
      investigating: alerts.filter((a) => a.status === 'investigating').length,
      highRisk: alerts.filter((a) => a.risk_level === 'HIGH').length,
      mediumRisk: alerts.filter((a) => a.risk_level === 'MEDIUM').length,
      avgRiskScore: alerts.length > 0
        ? Math.round(alerts.reduce((sum, a) => sum + (a.risk_score || 0), 0) / alerts.length)
        : 0,
    };

    res.status(200).json({ success: true, data: { overview: stats } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeTransaction,
  analyzeWithMLService,
  getAlerts,
  getAlert,
  updateAlertStatus,
  addInvestigationNote,
  getAlertStats,
};
