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

  async generateMarketInsights(req, res) {
    try {
      const { summary } = req.body

      if (!summary) {
        return res.status(400).json({
          success: false,
          error: 'No summary provided',
        })
      }

      const insights = await geminiService.generateMarketInsights(summary)

      res.json({
        success: true,
        insights,
      })
    } catch (error) {
      console.error('Error generating market insights:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to generate market insights',
      })
    }
  }

  async generateIdeaRankerScore(req, res) {
    try {
      const { summary } = req.body

      if (!summary) {
        return res.status(400).json({
          success: false,
          error: 'No summary provided',
        })
      }

      const rankerData = await geminiService.generateIdeaRankerScore(summary)

      res.json({
        success: true,
        data: rankerData,
      })
    } catch (error) {
      console.error('Error generating idea ranker score:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to generate idea ranker score',
      })
    }
  }

  async generateCompetitors(req, res) {
    try {
      const { summary } = req.body

      if (!summary) {
        return res.status(400).json({
          success: false,
          error: 'No summary provided',
        })
      }

      const competitorsData = await geminiService.generateCompetitors(summary)

      res.json({
        success: true,
        data: competitorsData,
      })
    } catch (error) {
      console.error('Error generating competitors:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to generate competitors',
      })
    }
  }
}

module.exports = new IdeaController()
