import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workspace - Content Intelligence Platform',
  description: 'Collaborative workspace editor with real-time editing, comments, and version history',
};

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
