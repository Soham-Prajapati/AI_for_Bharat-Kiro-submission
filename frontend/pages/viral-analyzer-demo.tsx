import React from 'react';
import ViralAnalyzer from '../components/ViralAnalyzer';

/**
 * Demo page for the ViralAnalyzer component
 * 
 * This page demonstrates the ViralAnalyzer component with mock data.
 * In a production environment, you would fetch real data from your API.
 */
const ViralAnalyzerDemo: React.FC = () => {
  return (
    <div className="min-h-screen">
      <ViralAnalyzer />
    </div>
  );
};

export default ViralAnalyzerDemo;
