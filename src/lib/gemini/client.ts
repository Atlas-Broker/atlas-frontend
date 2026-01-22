/**
 * Google Gemini AI Client
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GOOGLE_AI_API_KEY) {
  console.warn('⚠️  GOOGLE_AI_API_KEY is not configured in environment variables');
}

const apiKey = process.env.GOOGLE_AI_API_KEY || '';

/**
 * Initialize Google Generative AI client
 */
export const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Get Gemini model instance
 * @param modelName - Model name (default: gemini-2.0-flash-exp)
 */
export function getGeminiModel(modelName: string = 'gemini-2.0-flash-exp') {
  return genAI.getGenerativeModel({ model: modelName });
}

