const { GoogleGenerativeAI } = require('@google/generative-ai')

class PaletteService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
    })
  }

  async generateColorPalettes(businessName, summary, logoColors = []) {
    const logoColorsText = logoColors.length > 0 
      ? `Primary logo colors: ${logoColors.join(', ')}`
      : ''

    const prompt = `You are a professional brand color consultant. Generate 3 distinct, professional color palettes for a business called "${businessName}".

    Business Context: ${summary}
    ${logoColorsText}

    Each palette should:
    1. Include exactly 4 colors that work harmoniously together
    2. Be suitable for professional presentations and branding
    3. Reflect the business nature and industry
    4. Include a primary color, secondary color, accent color, and neutral color
    5. Provide descriptive names for each palette
    6. Consider color psychology and branding best practices

    Return a JSON object with this structure:
    {
      "palettes": [
        {
          "name": "Descriptive palette name",
          "colors": ["#hex1", "#hex2", "#hex3", "#hex4"],
          "description": "Brief description of when to use this palette"
        },
        {
          "name": "Descriptive palette name",
          "colors": ["#hex1", "#hex2", "#hex3", "#hex4"],
          "description": "Brief description of when to use this palette"
        },
        {
          "name": "Descriptive palette name",
          "colors": ["#hex1", "#hex2", "#hex3", "#hex4"],
          "description": "Brief description of when to use this palette"
        }
      ]
    }

    Rules:
    - Use valid hex color codes (e.g., #FFFFFF, #000000)
    - Colors should be distinct from each other across palettes
    - Ensure good contrast for readability
    - Make palettes professional and modern
    - If logo colors are provided, one palette should incorporate them

    Return ONLY valid JSON, without any backticks, code fences, or commentary.`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const rawText = response.text().trim()
      const cleanedText = rawText.replace(/```json\n?|```/gi, '').trim()

      try {
        const parsed = JSON.parse(cleanedText)
        // Ensure we have exactly 3 palettes
        if (parsed.palettes && parsed.palettes.length >= 3) {
          return parsed.palettes.slice(0, 3)
        } else {
          // Generate fallback palettes
          return this.getFallbackPalettes()
        }
      } catch (error) {
        console.error('Failed to parse palette JSON:', cleanedText)
        return this.getFallbackPalettes()
      }
    } catch (error) {
      console.error('Error generating palettes:', error)
      return this.getFallbackPalettes()
    }
  }

  getFallbackPalettes() {
    return [
      {
        name: 'Corporate Indigo',
        colors: ['#5B5FEF', '#10B981', '#F59E0B', '#F9FAFB'],
        description: 'Professional and trustworthy'
      },
      {
        name: 'Emerald & Gold',
        colors: ['#059669', '#FBBF24', '#F3F4F6', '#1F2937'],
        description: 'Growth and success focused'
      },
      {
        name: 'Crimson & Slate',
        colors: ['#DC2626', '#64748B', '#F1F5F9', '#1E293B'],
        description: 'Bold and contemporary'
      }
    ]
  }
}

module.exports = new PaletteService()

