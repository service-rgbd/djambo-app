import { AIChatMessage, api } from './api';

export const sendMessageToGemini = async (messages: AIChatMessage[] | string): Promise<string> => {
  const normalizedMessages = typeof messages === 'string'
    ? [{ role: 'user' as const, text: messages }]
    : messages;

  const response = await api.chatWithAssistant(normalizedMessages);
  return response.reply || 'Je ne peux pas generer de reponse pour le moment.';
};