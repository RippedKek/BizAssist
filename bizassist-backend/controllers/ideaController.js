const geminiService = require('../services/geminiService')

class IdeaController {
  async generateSummary(req, res) {
    try {
      const { idea } = req.body

      if (!idea) {
        return res.status(400).json({
          success: false,
          error: 'No idea text provided',
        })
      }

      const summary = await geminiService.generateSummary(idea)

      res.json({
        success: true,
        summary,
      })
    } catch (error) {
      console.error('Error generating summary:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to generate summary',
      })
    }
  }
}

module.exports = new IdeaController()
