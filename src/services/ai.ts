
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface SentimentResult {
  score: number; // -1 to 1
  label: 'Bullish' | 'Bearish' | 'Neutral';
  summary: string;
  headlines: string[];
}

export async function analyzeSentiment(symbol: string, companyName: string): Promise<SentimentResult> {
  const prompt = `Analyze the current market sentiment for ${companyName} (${symbol}). 
  First, identify 3-5 realistic recent financial news headlines for this company.
  Then, provide a sentiment score from -1 (Extremely Bearish) to 1 (Extremely Bullish).
  Finally, provide a brief 2-sentence summary of why this sentiment exists.
  
  Return the result in JSON format like this:
  {
    "score": number,
    "label": "Bullish" | "Bearish" | "Neutral",
    "summary": "string",
    "headlines": ["string", "string"]
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      score: result.score ?? 0,
      label: result.label ?? 'Neutral',
      summary: result.summary ?? 'No summary available.',
      headlines: result.headlines ?? []
    };
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return {
      score: 0,
      label: 'Neutral',
      summary: 'Unable to perform sentiment analysis at this time.',
      headlines: []
    };
  }
}

export async function getMLExplanation(symbol: string, predictions: any[]): Promise<string> {
  const prompt = `You are a professional quantitative analyst. 
  Given the stock ${symbol} and the following predicted prices for the next 90 days:
  Starting at: ${predictions[0]?.close}
  Ending at: ${predictions[predictions.length - 1]?.close}
  
  Briefly explain the "Machine Learning model's" reasoning for this trend in 3 professional sentences. 
  Mention factors like historical volatility and mean reversion if applicable.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    return response.text || "Reasoning unavailable.";
  } catch (error) {
    return "Reasoning unavailable.";
  }
}
