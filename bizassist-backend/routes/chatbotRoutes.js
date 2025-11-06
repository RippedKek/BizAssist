const express = require('express')
const chatbotController = require('../controllers/chatbotController')

const router = express.Router()

router.post('/chat', chatbotController.chat)
router.post('/idea-ranker-chat', chatbotController.ideaRankerChat)

module.exports = router
