/**
 * OpenAI Service for Seekon AI Assistant
 * Production-ready integration with GPT-4o for intelligent shopping assistance
 */

import axios from 'axios';

class OpenAIService {
  constructor() {
    // ⚠️ SECURITY NOTE: In a real production app with paying users, 
    // you should move this API call to your Backend to hide this key.
    // For a portfolio/demo, using it here with usage limits set in OpenAI dashboard is acceptable.
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
    this.model = 'gpt-4o'; 
    
    if (!this.apiKey) {
      console.warn('⚠️ OpenAI API Key is missing. Check your .env file for VITE_OPENAI_API_KEY');
    }

    // Initialize axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });
  }

  /**
   * Generate intelligent response for Seekon AI
   * @param {string} message - User's message
   * @param {Object} context - Additional context (user profile, cart, etc.)
   * @returns {Promise<Object>} AI response with message and suggestions
   */
  async generateResponse(message, context = {}) {
    // Fail gracefully if no key is present
    if (!this.apiKey) {
      return this.getFallbackResponse(message, { message: 'Missing API Key' });
    }

    try {
      const systemPrompt = this.buildSystemPrompt(context);
      const userPrompt = this.buildUserPrompt(message, context);

      const response = await this.client.post('/chat/completions', {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 500,
        temperature: 0.8,
        presence_penalty: 0.6,
        frequency_penalty: 0.3,
      });

      const aiResponse = response.data.choices[0].message.content;
      
      return {
        message: aiResponse,
        suggestions: this.extractSuggestions(aiResponse),
        metadata: {
          model: this.model,
          tokens: response.data.usage?.total_tokens,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('OpenAI API Error:', error);
      return this.getFallbackResponse(message, error);
    }
  }

  /**
   * Analyze image for visual search and product recommendations
   */
  async analyzeImage(image, prompt = 'Analyze this fashion image for style, brand, and color recommendations') {
    if (!this.apiKey) return this.getImageAnalysisFallback({ message: 'Missing API Key' });

    try {
      let imageData;
      
      if (typeof image === 'string') {
        imageData = image;
      } else {
        imageData = await this.convertFileToBase64(image);
      }

      const response = await this.client.post('/chat/completions', {
        model: 'gpt-4o', // GPT-4o with vision capabilities
        messages: [
          {
            role: 'system',
            content: `You are Seekon, a stylish fashion expert. Analyze images for:
            - Style and aesthetic (casual, formal, athletic, streetwear)
            - Brand identification (Nike, Adidas, Jordan, etc.)
            - Color palette and patterns
            - Fit and silhouette
            - Occasion appropriateness
            - Complementary pieces needed
            
            Be specific, energetic, and suggestive in your analysis.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 400,
        temperature: 0.7,
      });

      const analysis = response.data.choices[0].message.content;
      
      return {
        analysis,
        recommendations: this.extractProductRecommendations(analysis),
        metadata: {
          model: 'gpt-4o-vision',
          tokens: response.data.usage?.total_tokens,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Image Analysis Error:', error);
      return this.getImageAnalysisFallback(error);
    }
  }

  /**
   * Build system prompt for Seekon AI personality
   */
  buildSystemPrompt(context) {
    return `You are Seekon, a stylish, friendly, and expert shopping assistant for Seekon Apparel. 

PERSONALITY TRAITS:
- Stylish and fashion-forward
- Friendly and energetic (use "babe", "gorgeous", "beautiful")
- Expert knowledge of fashion, brands, and styling
- Enthusiastic and encouraging
- Specific and actionable advice

EXPERTISE AREAS:
- Product knowledge (Nike, Adidas, Jordan, Puma, etc.)
- Size guides and fit recommendations
- Style coordination and outfit building
- Color theory and fashion trends
- Shopping assistance and deals
- Order tracking and customer service

RESPONSE STYLE:
- Use emojis and exclamation points
- Be specific and persuasive
- Include actionable suggestions
- Show enthusiasm and expertise
- End with engaging questions

CONTEXT:
- User: ${context.user?.name || 'Guest'}
- Cart items: ${context.cartItems?.map(i => i.name).join(', ') || 'None'}
- Recent searches: ${context.recentSearches?.join(', ') || 'None'}

Always respond as Seekon with personality, expertise, and enthusiasm!`;
  }

  /**
   * Build user prompt with context
   */
  buildUserPrompt(message, context) {
    let prompt = `User message: "${message}"\n\n`;
    
    // Add context if available to help the AI be smarter
    if (context.cartItems?.length > 0) {
      prompt += `[Context] Current cart items: ${context.cartItems.map(item => item.name).join(', ')}\n`;
    }
    
    prompt += `\nRespond as Seekon with specific, energetic, and helpful advice!`;
    return prompt;
  }

  /**
   * Extract suggestions from AI response
   */
  extractSuggestions(response) {
    const suggestions = [];
    
    const patterns = [
      /show me (.+?)(?:\s|$)/gi,
      /find (.+?)(?:\s|$)/gi,
      /help with (.+?)(?:\s|$)/gi,
      /track (.+?)(?:\s|$)/gi,
      /recommend (.+?)(?:\s|$)/gi,
    ];
    
    patterns.forEach(pattern => {
      const matches = response.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const suggestion = match.replace(pattern, '$1').trim();
          if (suggestion && !suggestions.includes(suggestion)) {
            suggestions.push(suggestion);
          }
        });
      }
    });
    
    if (suggestions.length === 0) {
      return ['Show me Nike shoes', 'Track my order', 'Style recommendations', 'Size help'];
    }
    
    return suggestions.slice(0, 5);
  }

  extractProductRecommendations(analysis) {
    const recommendations = [];
    const brands = analysis.match(/(nike|adidas|jordan|puma|converse|new balance)/gi);
    if (brands) {
      brands.forEach(brand => {
        if (!recommendations.includes(`${brand} products`)) recommendations.push(`${brand} products`);
      });
    }
    return recommendations.slice(0, 4);
  }

  async convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  getFallbackResponse(message, error) {
    return {
      message: "Hey gorgeous! I'm having a little tech moment (API Key issue or Network), but I'm still here for you! 🔥 Try asking me about our latest Nike drops!",
      suggestions: ['Show me Nike shoes', 'Track my order', 'Style help'],
      error: error.message,
      fallback: true
    };
  }

  getImageAnalysisFallback(error) {
    return {
      analysis: "I'm having trouble analyzing that image right now, but I'm still here to help! 🔥",
      recommendations: ['Nike shoes', 'Adidas apparel'],
      error: error.message,
      fallback: true
    };
  }
}

// Export singleton instance
export default new OpenAIService();