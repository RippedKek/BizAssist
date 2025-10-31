const express = require('express')
const ideaController = require('../controllers/ideaController')

const router = express.Router()

router.post('/idea-summary', ideaController.generateSummary)

module.exports = router
