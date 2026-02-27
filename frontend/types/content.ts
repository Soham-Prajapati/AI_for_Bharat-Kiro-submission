export interface ContentItem {
  id: string;
  title: string;
  platform: 'YouTube' | 'Instagram' | 'LinkedIn' | 'Twitter' | 'Facebook' | 'Blog';
  language: string;
  content: string;
  thumbnail?: string;
  createdAt: string;
  engagement: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
  };
  status: 'draft' | 'published' | 'scheduled';
  tags: string[];
}

export interface AnalyticsData {
  platform: string;
  views: number;
  engagement: number;
  reach: number;
}

export interface ExportFormat {
  type: 'pdf' | 'json' | 'csv';
  label: string;
  icon: string;
}
