const express = require('express');
const router = express.Router();
const { analyzeTransaction, getAlerts, getAlert, updateAlertStatus, addInvestigationNote, getAlertStats } = require('../controllers/fraudController');
const { protect, authorize } = require('../middleware/auth');
const { alertStatusValidation, investigationNotesValidation } = require('../middleware/validator');

router.use(protect);
router.post('/analyze', analyzeTransaction);
router.get('/alerts', getAlerts);
router.get('/alerts/stats', getAlertStats);
router.get('/alerts/:id', getAlert);
router.put('/alerts/:id', authorize('admin'), alertStatusValidation, updateAlertStatus);
router.post('/alerts/:id/notes', authorize('admin'), investigationNotesValidation, addInvestigationNote);

module.exports = router;

