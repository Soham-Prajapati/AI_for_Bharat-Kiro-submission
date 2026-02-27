import { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useWebSocket } from './useWebSocket';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000';

interface GenerationUpdate {
  jobId: string;
  progress: number;
  step: string;
  message: string;
  status: 'processing' | 'completed' | 'failed';
}

export function useRealtimeGeneration(jobId?: string) {
  const { actions } = useAppContext();

  const { sendMessage, isConnected, lastMessage } = useWebSocket({
    url: `${WS_URL}/generation`,
    onMessage: (message) => {
      if (message.type === 'generation:update') {
        const update: GenerationUpdate = message.data;
        
        // Update generation status in global state
        actions.setGenerationStatus({
          isGenerating: update.status === 'processing',
          progress: update.progress,
          message: update.message,
        });

        // If completed, clear status after delay
        if (update.status === 'completed') {
          setTimeout(() => {
            actions.setGenerationStatus(null);
          }, 3000);
        }

        // If failed, show error
        if (update.status === 'failed') {
          actions.setError(update.message);
          actions.setGenerationStatus(null);
        }
      }
    },
    onOpen: () => {
      console.log('[Realtime] Connected to generation stream');
    },
    onClose: () => {
      console.log('[Realtime] Disconnected from generation stream');
    },
    reconnect: true,
    reconnectAttempts: 5,
    reconnectInterval: 3000,
  });

  // Subscribe to job updates when jobId changes
  useEffect(() => {
    if (isConnected && jobId) {
      sendMessage('subscribe', { jobId });
      
      return () => {
        sendMessage('unsubscribe', { jobId });
      };
    }
  }, [isConnected, jobId, sendMessage]);

  return {
    isConnected,
    lastMessage,
    subscribe: (newJobId: string) => {
      sendMessage('subscribe', { jobId: newJobId });
    },
    unsubscribe: (oldJobId: string) => {
      sendMessage('unsubscribe', { jobId: oldJobId });
    },
  };
}
