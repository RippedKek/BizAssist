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
}

module.exports = new GeminiService()
