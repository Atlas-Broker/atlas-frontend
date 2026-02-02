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
 * @param modelName - Model name (default: from GOOGLE_AI_MODEL env or gemini-1.5-flash)
 */
export function getGeminiModel(modelName?: string) {
  const model = modelName || process.env.GOOGLE_AI_MODEL || 'gemini-1.5-flash';
  return genAI.getGenerativeModel({ model });
}

