const geminiService = require('../services/geminiService')

class ChatbotController {
  async chat(req, res) {
    try {
      const { message, marketInsights, conversationHistory } = req.body

      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'No message provided',
        })
      }

      const response = await geminiService.generateChatbotResponse(
        message,
        marketInsights,
        conversationHistory || []
      )

      res.json({
        success: true,
        response,
      })
    } catch (error) {
      console.error('Error generating chatbot response:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to generate chatbot response',
      })
    }
  }

  async ideaRankerChat(req, res) {
    try {
      const { message, rankerData, competitors, conversationHistory } = req.body

      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'No message provided',
        })
      }

      const response = await geminiService.generateIdeaRankerChatbotResponse(
        message,
        rankerData,
        competitors,
        conversationHistory || []
      )

      res.json({
        success: true,
        response,
      })
    } catch (error) {
      console.error('Error generating idea ranker chatbot response:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to generate chatbot response',
      })
    }
  }
}

module.exports = new ChatbotController()
