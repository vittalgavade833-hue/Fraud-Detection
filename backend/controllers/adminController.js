const { supabase } = require('../config/db');
const { ErrorResponse } = require('../middleware/errorHandler');

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const { data: users } = await supabase.from('users').select('id, role, is_active');
    const { data: txns } = await supabase.from('transactions').select('id, risk_level, is_fraud, amount, status');
    const { data: alerts } = await supabase.from('fraud_alerts').select('id, status, risk_level');

    res.status(200).json({
      success: true,
      data: {
        totalUsers: users?.length || 0,
        activeUsers: users?.filter(u => u.is_active).length || 0,
        totalTransactions: txns?.length || 0,
        totalAmount: txns?.reduce((s, t) => s + parseFloat(t.amount || 0), 0) || 0,
        suspiciousTransactions: txns?.filter(t => t.risk_level === 'MEDIUM' || t.risk_level === 'HIGH').length || 0,
        confirmedFraud: alerts?.filter(a => a.status === 'confirmed_fraud').length || 0,
        highRiskCount: txns?.filter(t => t.risk_level === 'HIGH').length || 0,
        totalAlerts: alerts?.length || 0,
        newAlerts: alerts?.filter(a => a.status === 'new').length || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('users')
      .select('id, name, email, role, is_active, last_login, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

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
 * @desc    Update user status
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { is_active, role } = req.body;
    const updates = {};
    if (is_active !== undefined) updates.is_active = is_active;
    if (role) updates.role = role;

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.params.id)
      .select('id, name, email, role, is_active, last_login, created_at')
      .single();

    if (error) return next(new ErrorResponse(error.message, 400));

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get fraud trends
 * @route   GET /api/admin/trends
 * @access  Private/Admin
 */
const getTrends = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data: txns } = await supabase
      .from('transactions')
      .select('created_at, risk_level, is_fraud, amount')
      .gte('created_at', since)
      .order('created_at', { ascending: true });

    // Group by date
    const byDate = {};
    (txns || []).forEach(t => {
      const date = t.created_at.slice(0, 10);
      if (!byDate[date]) byDate[date] = { date, total: 0, fraud: 0, suspicious: 0, amount: 0 };
      byDate[date].total++;
      if (t.is_fraud) byDate[date].fraud++;
      if (t.risk_level === 'MEDIUM' || t.risk_level === 'HIGH') byDate[date].suspicious++;
      byDate[date].amount += parseFloat(t.amount || 0);
    });

    res.status(200).json({
      success: true,
      data: Object.values(byDate),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recent activity
 * @route   GET /api/admin/activity
 * @access  Private/Admin
 */
const getRecentActivity = async (req, res, next) => {
  try {
    const { data: recentTxns } = await supabase
      .from('transactions')
      .select('*, users!transactions_user_id_fkey(id, name, email)')
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: recentAlerts } = await supabase
      .from('fraud_alerts')
      .select('*, transactions(*), users!fraud_alerts_user_id_fkey(id, name, email)')
      .order('created_at', { ascending: false })
      .limit(10);

    res.status(200).json({
      success: true,
      data: { recentTransactions: recentTxns || [], recentAlerts: recentAlerts || [] },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getUsers, updateUserStatus, getTrends, getRecentActivity };

