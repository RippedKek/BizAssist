const express = require('express')
const multer = require('multer')
const router = express.Router()
const pitchPracticeController = require('../controllers/pitchPracticeController')

const upload = multer({ storage: multer.memoryStorage() })

// POST /api/v1/pitch-practice/assess
router.post('/assess', upload.single('audio'), pitchPracticeController.assessPitchPractice)

module.exports = router


