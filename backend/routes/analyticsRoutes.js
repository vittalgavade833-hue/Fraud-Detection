const express = require('express');
const router = express.Router();
const { getDailyVolume, getWeeklyTrends, getMonthlyStats, getRiskDistribution, getAmountAnalysis, exportReport } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/daily-volume', getDailyVolume);
router.get('/weekly-trends', getWeeklyTrends);
router.get('/monthly-stats', getMonthlyStats);
router.get('/risk-distribution', getRiskDistribution);
router.get('/amount-analysis', getAmountAnalysis);
router.get('/export', exportReport);

module.exports = router;

