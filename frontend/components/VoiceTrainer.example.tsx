'use client';

import React, { useState } from 'react';
import VoiceTrainer from './VoiceTrainer';

export function BasicVoiceTrainerExample() {
  const [modelId, setModelId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrainingComplete = (newModelId: string) => {
    setModelId(newModelId);
  };

  const handleError = (err: Error) => {
    setError(err.message);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Voice Trainer Example</h1>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {modelId && <div className="text-green-500 mb-4">Trained Model: {modelId}</div>}
      
      <VoiceTrainer
        userId="demo-user"
        onTrainingComplete={handleTrainingComplete}
        onError={handleError}
      />
    </div>
  );
}

export default BasicVoiceTrainerExample;
