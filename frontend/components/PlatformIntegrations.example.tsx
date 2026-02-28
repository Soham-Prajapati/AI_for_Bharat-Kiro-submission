'use client';

import React from 'react';
import PlatformIntegrations from './PlatformIntegrations';
import { ToastProvider } from '@/context/ToastContext';
import ToastContainer from './ToastContainer';

/**
 * Example usage of the PlatformIntegrations component
 * 
 * This component demonstrates how to integrate the PlatformIntegrations
 * component into your application with the required ToastProvider context.
 */
export default function PlatformIntegrationsExample() {
  return (
    <ToastProvider>
      <div className="min-h-screen">
        <PlatformIntegrations />
        <ToastContainer />
      </div>
    </ToastProvider>
  );
}

/**
 * Usage in a Next.js page:
 * 
 * // app/integrations/page.tsx
 * import PlatformIntegrations from '@/components/PlatformIntegrations';
 * import { ToastProvider } from '@/context/ToastContext';
 * import ToastContainer from '@/components/ToastContainer';
 * 
 * export default function IntegrationsPage() {
 *   return (
 *     <ToastProvider>
 *       <PlatformIntegrations />
 *       <ToastContainer />
 *     </ToastProvider>
 *   );
 * }
 * 
 * 
 * Features included:
 * - 6 platform integrations (YouTube, Instagram, LinkedIn, Twitter, TikTok, Facebook)
 * - OAuth flow simulation with connect/disconnect
 * - Real-time connection status indicators
 * - Account information display (username, followers, last sync)
 * - Sync functionality with loading states
 * - Platform-specific settings modal
 * - Toast notifications for all actions
 * - Responsive grid layout (3 cols desktop, 2 tablet, 1 mobile)
 * - Smooth animations with Framer Motion
 * - Dark mode UI with TailwindCSS
 * - Production-ready error handling
 */
