import { post } from '@/lib/api/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AssistantRequest = {
  question: string;
  citizenId?: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
};

export type AssistantResponse = {
  answer: string;
};

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const assistantService = {
  /**
   * Send a question to the AI assistant and receive an answer.
   */
  ask: (payload: AssistantRequest) => {
    console.log('assistantService.ask() called');
    console.log('API Base URL:', process.env.EXPO_PUBLIC_API_BASE_URL);
    console.log('Endpoint:', `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/assistant`);
    const token = require('@/store/authStore').useAuthStore.getState().token;
    console.log('JWT exists:', !!token);
    console.log('Citizen ID:', payload.citizenId);
    console.log('Request body:', JSON.stringify(payload, null, 2));
    return post<AssistantResponse, AssistantRequest>('/api/assistant', payload);
  },
};
