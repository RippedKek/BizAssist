const { GoogleGenerativeAI } = require('@google/generative-ai')

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
    })
  }

  async generateSummary(idea) {
    const prompt = `As an experienced critical business analyst, provide a concise summary of the following business idea with respect to Bangladesh market. Focus on the core value proposition, target market, and potential viability. Keep it clear and professional. The output should be no more than 100 words and in one paragraph. Do not include any additional commentary. Just start the summary, nothing else:

    Business Idea: ${idea}

    Summary:`

    const result = await this.model.generateContent(prompt)
    const response = await result.response
    return response.text()
  }

  async generateIdeaTitle(summary) {
    const prompt = `Based on the following business idea summary, generate a concise, catchy business name or title (maximum 5 words). The title should be professional and memorable. Return ONLY the title, nothing else:

    Summary: ${summary}

    Title:`

    const result = await this.model.generateContent(prompt)
    const response = await result.response
    return response.text().trim()
  }

  async generateIdeaRankerScore(summary) {
    const prompt = `You are a senior critical business analyst evaluating startup ideas in the Bangladesh market. Analyze the following business concept and provide a comprehensive scoring breakdown.

    Business Summary: ${summary}

    Respond with a single JSON object that strictly matches the following TypeScript interface. All scores must be numbers between 0 and 100. Provide detailed justifications for each score. Be honest and realistic in your analysis. Focus on both positive and negative aspects of the business idea heavily focusing on monetary value and potential growth.

    interface IdeaRankerScore {
      ideaTitle: string
      overallScore: number
      readinessLabel: string
      scores: {
        novelty: {
          score: number
          justification: string
        }
        localCapability: {
          score: number
          justification: string
        }
        feasibility: {
          score: number
          justification: string
        }
        sustainability: {
          score: number
          justification: string
        }
        globalDemand: {
          score: number
          justification: string
        }
      }
      nextSteps: Array<{
        text: string
      }>
    }

    Rules:
    - ideaTitle: A concise, catchy name (max 5 words)
    - overallScore: Average of all 5 scores, rounded to nearest integer
    - readinessLabel: Based on overallScore:
      * 90-100: "Exceptional Potential"
      * 80-89: "Strong Potential"
      * 70-79: "Good Potential"
      * 60-69: "Moderate Potential"
      * Below 60: "Needs Refinement"
    - Each score should be realistic and well-justified
    - Provide 2-3 actionable nextSteps
    - Focus on Bangladesh market context

    Return ONLY valid JSON, without any backticks, code fences, or commentary.`

    const result = await this.model.generateContent(prompt)
    const response = await result.response
    const rawText = response.text().trim()
    const cleanedText = rawText.replace(/```json\n?|```/gi, '').trim()

    try {
      return JSON.parse(cleanedText)
    } catch (error) {
      console.error('Failed to parse idea ranker JSON:', cleanedText)
      throw new Error('Invalid JSON returned from Gemini')
    }
  }

  async generateMarketInsights(summary) {
    const prompt = `You are a senior international critical go-to-market strategist. Using the provided business concept summary in Bangladesh market, produce a structured analysis that will help an entrepreneur evaluate global expansion potential. Be honest and realistic in your analysis. Focus on both positive and negative aspects of the business idea heavily focusing on monetary value and potential growth.

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

  async generateCompetitors(summary) {
    const prompt = `You are a senior competitive intelligence analyst specializing in the Bangladesh market. Based on the following business idea summary, identify the top 3 real competitors that are OPERATING IN BANGLADESH ONLY. For each competitor, provide their actual company name, a valid website URL (if available), and a brief description of what they do.

    Business Summary: ${summary}

    Respond with a single JSON object that strictly matches the following TypeScript interface:

    interface Competitors {
      competitors: Array<{
        title: string
        website: string
        description: string
      }>
    }

    Rules:
    - Provide exactly 3 competitors
    - CRITICAL: ALL competitors MUST be companies/brands that are currently operating in Bangladesh. Do not include international or regional competitors unless they have active operations in Bangladesh.
    - If you cannot find 3 Bangladesh-based competitors, still provide 3 but indicate in the description if they are smaller/local players or emerging companies in the Bangladesh market.
    - title: The actual company/brand name operating in Bangladesh
    - website: A valid URL (use "https://" format). If no website is known, use "#" or leave as empty string
    - description: A concise 1-2 sentence description of what the competitor does in Bangladesh and why they're relevant to this business idea
    - Focus exclusively on real, existing companies with operations in Bangladesh
    - Be realistic and honest about competitive landscape in the Bangladesh market

    Return ONLY valid JSON, without any backticks, code fences, or commentary.`

    const result = await this.model.generateContent(prompt)
    const response = await result.response
    const rawText = response.text().trim()
    const cleanedText = rawText.replace(/```json\n?|```/gi, '').trim()

    try {
      return JSON.parse(cleanedText)
    } catch (error) {
      console.error('Failed to parse competitors JSON:', cleanedText)
      throw new Error('Invalid JSON returned from Gemini')
    }
  }

  async generateBusinessNames(summary) {
    const prompt = `You are a creative brand naming expert specializing in Bangladesh market. Based on the following business idea summary, generate 5-6 catchy, memorable, and professional business names. Names should be:
    - Relevant to the business concept
    - Suitable for Bangladesh market (considering local language and culture)
    - Professional and brandable
    - Easy to pronounce and remember
    - Between 2-4 words each

    Business Summary: ${summary}

    Respond with a single JSON object that strictly matches the following TypeScript interface:

    interface BusinessNames {
      names: string[]
    }

    Rules:
    - Provide exactly 5-6 business name suggestions
    - Each name should be a string (just the name, no additional description)
    - Names should be unique and creative
    - Consider incorporating Bengali/English hybrid names if appropriate
    - Focus on names that convey the business value proposition

    Return ONLY valid JSON, without any backticks, code fences, or commentary.`

    const result = await this.model.generateContent(prompt)
    const response = await result.response
    const rawText = response.text().trim()
    const cleanedText = rawText.replace(/```json\n?|```/gi, '').trim()

    try {
      return JSON.parse(cleanedText)
    } catch (error) {
      console.error('Failed to parse business names JSON:', cleanedText)
      throw new Error('Invalid JSON returned from Gemini')
    }
  }

  async generatePitchSpeech(summary, businessTitle, selectedSections, timeLimit, additionalInfo = '') {
    const sections = selectedSections.join(', ')
    let additionalGuidanceText = ''
    
    if (additionalInfo && additionalInfo.trim()) {
      additionalGuidanceText = `\n\nAdditional Guidance and Context:\n${additionalInfo}\n\nPlease tailor the pitch speech based on the above guidance. Consider the presentation venue, audience, judges, or specific focus areas mentioned.`
    }
    
    const prompt = `You are a professional pitch coach and presentation expert. Generate a complete pitch speech for a business idea with precise timing information for each section.

    Business Summary: ${summary}
    Business Title: ${businessTitle}
    Selected Sections: ${sections}
    Total Time Limit: ${timeLimit} minutes${additionalGuidanceText}

    Respond with a single JSON object that strictly matches the following TypeScript interface:

    interface PitchSpeech {
      sections: Array<{
        sectionName: string
        content: string
        timeMinutes: number
        timeSeconds: number
        notes?: string
      }>
      totalTimeMinutes: number
      totalTimeSeconds: number
    }

    Rules:
    - Generate speech content for each selected section
    - Distribute the total time (${timeLimit} minutes) proportionally across all sections
    - content: The actual speech text that should be spoken for that section
    - timeMinutes and timeSeconds: Precise timing for each section (should sum to approximately ${timeLimit} minutes)
    - notes: Optional tips or reminders for delivering that section
    - Make the speech conversational and engaging, suitable for investor presentations
    - Focus on Bangladesh market context
    - Ensure the speech flows naturally between sections
    - Total time should be close to but not exceed ${timeLimit} minutes${additionalInfo && additionalInfo.trim() ? '\n- Incorporate the additional guidance provided above into the pitch speech content and tone' : ''}

    Return ONLY valid JSON, without any backticks, code fences, or commentary.`

    const result = await this.model.generateContent(prompt)
    const response = await result.response
    const rawText = response.text().trim()
    const cleanedText = rawText.replace(/```json\n?|```/gi, '').trim()

    try {
      return JSON.parse(cleanedText)
    } catch (error) {
      console.error('Failed to parse pitch speech JSON:', cleanedText)
      throw new Error('Invalid JSON returned from Gemini')
    }
  }
}

module.exports = new GeminiService()
