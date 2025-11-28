const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');

router.get('/revenue', reportController.getRevenueReport.bind(reportController));
router.get('/utilization', reportController.getUtilizationReport.bind(reportController));
router.get('/popular-categories', reportController.getPopularCategories.bind(reportController));
router.get('/dashboard', reportController.getDashboardSummary.bind(reportController));

module.exports = router;
