import { useState, useCallback } from 'react';
import { generateAIResponse, simplifyPolicyText } from '../utils/aiEngine';
import type { AIResult } from '../utils/aiEngine';


export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  source?: 'local' | 'gemini';
  data?: any;

}

export function useGenAI() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (text: string, lang: string = 'en') => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      // Map current messages to context required for history
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const aiResponse = await generateAIResponse(text, lang, history);

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'model',
        content: aiResponse.text,
        timestamp: new Date(),
        source: aiResponse.source,
        data: aiResponse.data
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : 'An error occurred while generating the response.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const simplifyPolicy = useCallback(async (text: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await simplifyPolicyText(text);
      return result;
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : 'An error occurred while simplifying the policy.';
      setError(errMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    simplifyPolicy
  };
}
