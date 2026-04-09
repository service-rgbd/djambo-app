import { GoogleGenAI } from "@google/genai";
import { vehicles, maintenanceRecords, revenueData } from './mockData';

const getContextData = () => {
  return JSON.stringify({
    vehicles,
    maintenanceRecords,
    financialSummary: revenueData,
    summary: "La date actuelle est Mars 2024."
  });
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Clé API non trouvée");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const context = getContextData();
    const systemInstruction = `
      Tu es un Assistant IA expert en Gestion de Flotte nommé 'FleetMind'.
      Tu as accès aux données de la flotte en temps réel au format JSON : ${context}.
      
      Ton rôle est d'aider le gestionnaire de flotte avec des analyses, des résumés et une aide à la décision.
      
      Règles :
      1. Sois concis et professionnel.
      2. Si on te demande des détails sur un véhicule, utilise son ID ou Modèle.
      3. Pour les conseils financiers, analyse les données de 'revenueData'.
      4. Pour la maintenance, regarde 'maintenanceRecords' et le statut des véhicules.
      5. Formate ta réponse en Markdown (mets en gras les chiffres clés).
      6. Réponds TOUJOURS en français.
      7. Si la question est hors sujet, redirige poliment l'utilisateur.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "Je ne peux pas générer de réponse pour le moment.";
  } catch (error) {
    console.error("Erreur API Gemini:", error);
    return "Désolé, j'ai rencontré une erreur de connexion au réseau d'intelligence de la flotte.";
  }
};