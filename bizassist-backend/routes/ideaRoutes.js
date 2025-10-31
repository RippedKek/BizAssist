const express = require('express')
const ideaController = require('../controllers/ideaController')

const router = express.Router()

router.post('/idea-summary', ideaController.generateSummary)
router.post('/market-insights', ideaController.generateMarketInsights)

module.exports = router
