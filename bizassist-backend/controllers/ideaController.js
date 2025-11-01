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

  async generateBusinessNames(req, res) {
    try {
      const { summary } = req.body

      if (!summary) {
        return res.status(400).json({
          success: false,
          error: 'No summary provided',
        })
      }

      const namesData = await geminiService.generateBusinessNames(summary)

      res.json({
        success: true,
        data: namesData,
      })
    } catch (error) {
      console.error('Error generating business names:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to generate business names',
      })
    }
  }

  async generatePitchSpeech(req, res) {
    try {
      const { summary, businessTitle, selectedSections, timeLimit, additionalInfo } = req.body

      if (!summary || !businessTitle || !selectedSections || !timeLimit) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: summary, businessTitle, selectedSections, timeLimit',
        })
      }

      if (!Array.isArray(selectedSections) || selectedSections.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'selectedSections must be a non-empty array',
        })
      }

      const pitchData = await geminiService.generatePitchSpeech(
        summary,
        businessTitle,
        selectedSections,
        timeLimit,
        additionalInfo
      )

      res.json({
        success: true,
        data: pitchData,
      })
    } catch (error) {
      console.error('Error generating pitch speech:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to generate pitch speech',
      })
    }
  }

  async generateSlide(req, res) {
    try {
      const { sectionName, sectionContent, businessTitle, summary, slideNumber, totalSlides } = req.body

      if (!sectionName || !sectionContent || !businessTitle || !summary) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: sectionName, sectionContent, businessTitle, summary',
        })
      }

      const slideCode = await geminiService.generateSlideCode(
        sectionName,
        sectionContent,
        businessTitle,
        summary,
        slideNumber || 1,
        totalSlides || 1
      )

      res.json({
        success: true,
        data: {
          slideCode,
        },
      })
    } catch (error) {
      console.error('Error generating slide:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to generate slide code',
      })
    }
  }
}

module.exports = new IdeaController()
