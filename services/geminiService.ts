import { GoogleGenAI } from "@google/genai";

export const generateAdDescription = async (title: string, category: string) => {
  try {
    // Fix: Updated initialization to use process.env.API_KEY directly without fallbacks per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere uma descrição profissional e persuasiva para um anúncio rural. Título: ${title}. Categoria: ${category}. Foco em vendas e credibilidade no agronegócio.`,
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao gerar descrição:", error);
    return null;
  }
};