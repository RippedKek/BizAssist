const { GoogleGenerativeAI } = require('@google/generative-ai')

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
    })
  }

  async generateSummary(idea) {
    const prompt = `As an experienced business analyst, provide a concise summary of the following business idea. Focus on the core value proposition, target market, and potential viability. Keep it clear and professional. The output should be no more than 100 words and in one paragraph. Do not include any additional commentary. Just start the summary, nothing else:

    Business Idea: ${idea}

    Summary:`

    const result = await this.model.generateContent(prompt)
    const response = await result.response
    return response.text()
  }

  async generateMarketInsights(summary) {
    const prompt = `You are a senior international go-to-market strategist. Using the provided business concept summary, produce a structured analysis that will help an entrepreneur evaluate global expansion potential.

    Business Summary: ${summary}

    Respond with a single JSON object that strictly matches the following TypeScript interface. Use concise, insight-driven copy. Percentages must be numbers between 0 and 100. Monetary values should include currency symbols. Provide 3 items for stats, 4-5 items for topMarkets, 3 items for globalHighlights, 3 challenges, and 3 recommendations.

    interface MarketInsights {
      headline: string
      feasibilityScore: {
        value: number
        label: string
        justification: string
      }
      stats: Array<{
        label: string
        value: string
        detail: string
      }>
      topMarkets: Array<{
        name: string
        percentage: number
        rationale: string
      }>
      globalHighlights: Array<{
        region: string
        signal: string
        detail: string
        percentage: number
      }>
      challenges: Array<{
        label: string
        percentage: number
        detail: string
      }>
      recommendations: Array<{
        text: string
      }>
    }

    Return ONLY valid JSON, without any backticks, code fences, or commentary.`

    const result = await this.model.generateContent(prompt)
    const response = await result.response
    const rawText = response.text().trim()
    const cleanedText = rawText.replace(/```json\n?|```/gi, '').trim()

    try {
      return JSON.parse(cleanedText)
    } catch (error) {
      console.error('Failed to parse market insights JSON:', cleanedText)
      throw new Error('Invalid JSON returned from Gemini')
    }
  }
}

module.exports = new GeminiService()
