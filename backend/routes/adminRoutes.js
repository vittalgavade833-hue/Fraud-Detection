const express = require('express');
const router = express.Router();
const { getDashboardStats, getUsers, updateUserStatus, getTrends, getRecentActivity } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUserStatus);
router.get('/trends', getTrends);
router.get('/activity', getRecentActivity);

module.exports = router;

