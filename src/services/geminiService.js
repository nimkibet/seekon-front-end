/**
 * Gemini Service for Seekon AI Assistant
 * Uses Google's free tier for intelligent shopping assistance
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!this.apiKey) {
      console.warn('⚠️ Gemini API Key is missing. Check your .env file for VITE_GEMINI_API_KEY');
    }

    // Initialize the Google Generative AI client
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    // Use the 'gemini-1.5-flash' model for speed and efficiency
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async generateResponse(message, context = {}) {
    if (!this.apiKey) {
      return this.getFallbackResponse({ message: 'Missing API Key' });
    }

    try {
      // Build the prompt with context
      const prompt = this.buildPrompt(message, context);

      // Generate content
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return {
        message: text,
        suggestions: this.extractSuggestions(text),
        metadata: {
          model: 'gemini-1.5-flash',
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Gemini API Error:', error);
      return this.getFallbackResponse(error);
    }
  }

  /**
   * Analyze image for visual search
   */
  async analyzeImage(imageFile, promptText = 'Analyze this fashion image for style, brand, and color recommendations') {
    if (!this.apiKey) return this.getImageAnalysisFallback({ message: 'Missing API Key' });

    try {
      // Convert file to Base64
      const base64Data = await this.fileToGenerativePart(imageFile);
      
      // Use gemini-1.5-flash which supports vision
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `You are Seekon, a stylish fashion expert. ${promptText}. 
      Return your response in a clear, enthusiastic tone.`;

      const result = await model.generateContent([prompt, base64Data]);
      const response = await result.response;
      const text = response.text();

      return {
        analysis: text,
        recommendations: this.extractProductRecommendations(text),
        metadata: {
          model: 'gemini-1.5-flash-vision',
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Gemini Image Analysis Error:', error);
      return this.getImageAnalysisFallback(error);
    }
  }

  buildPrompt(message, context) {
    let contextStr = '';
    if (context.cartItems?.length > 0) {
      contextStr += `User has these items in cart: ${context.cartItems.map(i => i.name).join(', ')}. `;
    }
    if (context.user?.name) {
      contextStr += `User's name is ${context.user.name}. `;
    }

    return `
      You are Seekon, a stylish, energetic, and helpful shopping assistant for Seekon Apparel.
      
      TONE: Friendly, trendy, uses emojis, enthusiastic (use words like "babe", "gorgeous", "fire").
      GOAL: Help the user find products, track orders, or give style advice.
      
      CONTEXT: ${contextStr}
      
      USER SAYS: "${message}"
      
      Provide a helpful, short response (under 3 sentences) with 2-3 specific suggestions.
    `;
  }

  extractSuggestions(text) {
    // Simple heuristic to grab potential topics from the text
    const defaults = ['Show me Nike', 'Track Order', 'Style Tips'];
    return defaults; 
  }

  extractProductRecommendations(text) {
    const brands = text.match(/(nike|adidas|jordan|puma|converse)/gi) || [];
    return [...new Set(brands)].map(b => `${b} products`).slice(0, 4);
  }

  async fileToGenerativePart(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        resolve({
          inlineData: {
            data: base64String,
            mimeType: file.type
          }
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  getFallbackResponse(error) {
    return {
      message: "I'm having a quick style nap (Network/Key Error)! 😴 But I'll be back to help you look fabulous soon.",
      suggestions: ['Try again'],
      error: error.message,
      fallback: true
    };
  }
  
  getImageAnalysisFallback(error) {
    return {
      analysis: "I couldn't see that image clearly right now. Mind describing it to me?",
      recommendations: [],
      error: error.message,
      fallback: true
    };
  }
}

export default new GeminiService();