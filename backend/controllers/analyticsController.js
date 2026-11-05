const { supabase } = require('../config/db');
const { ErrorResponse } = require('../middleware/errorHandler');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const fs = require('fs');

const getDailyVolume = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date(Date.now() - days * 86400000).toISOString();
    let query = supabase.from('transactions').select('created_at, amount, risk_level').gte('created_at', since);
    if (req.user.role !== 'admin') query = query.eq('user_id', req.user.id);
    const { data } = await query;
    const byDate = {};
    (data || []).forEach(t => {
      const d = t.created_at.slice(0, 10);
      if (!byDate[d]) byDate[d] = { date: d, count: 0, amount: 0 };
      byDate[d].count++;
      byDate[d].amount += parseFloat(t.amount || 0);
    });
    res.json({ success: true, data: Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)) });
  } catch (e) { next(e); }
};

const getWeeklyTrends = async (req, res, next) => {
  try {
    const weeks = parseInt(req.query.weeks) || 12;
    const since = new Date(Date.now() - weeks * 7 * 86400000).toISOString();
    let query = supabase.from('transactions').select('created_at, is_fraud, risk_level').gte('created_at', since);
    if (req.user.role !== 'admin') query = query.eq('user_id', req.user.id);
    const { data } = await query;
    const byWeek = {};
    (data || []).forEach(t => {
      const d = new Date(t.created_at);
      const weekStart = new Date(d); weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().slice(0, 10);
      if (!byWeek[key]) byWeek[key] = { week: key, total: 0, fraud: 0, suspicious: 0 };
      byWeek[key].total++;
      if (t.is_fraud) byWeek[key].fraud++;
      if (t.risk_level === 'MEDIUM' || t.risk_level === 'HIGH') byWeek[key].suspicious++;
    });
    res.json({ success: true, data: Object.values(byWeek).sort((a, b) => a.week.localeCompare(b.week)) });
  } catch (e) { next(e); }
};

const getMonthlyStats = async (req, res, next) => {
  try {
    const months = parseInt(req.query.months) || 12;
    const since = new Date(Date.now() - months * 30 * 86400000).toISOString();
    let query = supabase.from('transactions').select('created_at, amount, is_fraud, risk_level').gte('created_at', since);
    if (req.user.role !== 'admin') query = query.eq('user_id', req.user.id);
    const { data } = await query;
    const byMonth = {};
    (data || []).forEach(t => {
      const key = t.created_at.slice(0, 7);
      if (!byMonth[key]) byMonth[key] = { month: key, total: 0, amount: 0, fraud: 0 };
      byMonth[key].total++;
      byMonth[key].amount += parseFloat(t.amount || 0);
      if (t.is_fraud) byMonth[key].fraud++;
    });
    res.json({ success: true, data: Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month)) });
  } catch (e) { next(e); }
};

const getRiskDistribution = async (req, res, next) => {
  try {
    let query = supabase.from('transactions').select('risk_level');
    if (req.user.role !== 'admin') query = query.eq('user_id', req.user.id);
    const { data } = await query;
    const dist = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    (data || []).forEach(t => { if (t.risk_level && dist[t.risk_level] !== undefined) dist[t.risk_level]++; });
    res.json({ success: true, data: Object.entries(dist).map(([level, count]) => ({ level, count })) });
  } catch (e) { next(e); }
};

const getAmountAnalysis = async (req, res, next) => {
  try {
    let query = supabase.from('transactions').select('amount');
    if (req.user.role !== 'admin') query = query.eq('user_id', req.user.id);
    const { data } = await query;
    const ranges = [
      { label: '$0-100', min: 0, max: 100, count: 0 },
      { label: '$100-500', min: 100, max: 500, count: 0 },
      { label: '$500-1000', min: 500, max: 1000, count: 0 },
      { label: '$1000-5000', min: 1000, max: 5000, count: 0 },
      { label: '$5000-10000', min: 5000, max: 10000, count: 0 },
      { label: '$10000+', min: 10000, max: Infinity, count: 0 },
    ];
    (data || []).forEach(t => {
      const amt = parseFloat(t.amount);
      const r = ranges.find(r => amt >= r.min && amt < r.max);
      if (r) r.count++;
    });
    res.json({ success: true, data: ranges.map(({ label, count }) => ({ label, count })) });
  } catch (e) { next(e); }
};

const exportReport = async (req, res, next) => {
  try {
    let query = supabase.from('transactions').select('*');
    if (req.user.role !== 'admin') query = query.eq('user_id', req.user.id);
    query = query.order('created_at', { ascending: false }).limit(1000);
    const { data } = await query;
    const dir = path.join(__dirname, '..', 'exports');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `report_${Date.now()}.csv`);
    const csvWriter = createObjectCsvWriter({
      path: file,
      header: [
        { id: 'transaction_id', title: 'Transaction ID' },
        { id: 'amount', title: 'Amount' },
        { id: 'type', title: 'Type' },
        { id: 'risk_score', title: 'Risk Score' },
        { id: 'risk_level', title: 'Risk Level' },
        { id: 'is_fraud', title: 'Fraud' },
        { id: 'created_at', title: 'Date' },
      ],
    });
    await csvWriter.writeRecords(data || []);
    res.download(file, `report_${Date.now()}.csv`, () => fs.unlink(file, () => {}));
  } catch (e) { next(e); }
};

module.exports = { getDailyVolume, getWeeklyTrends, getMonthlyStats, getRiskDistribution, getAmountAnalysis, exportReport };

