'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EngagementDataPoint, PLATFORM_COLORS } from '@/types/analytics';

interface EngagementChartProps {
  data: EngagementDataPoint[];
}

export default function EngagementChart({ data }: EngagementChartProps) {
  return (
    <div
      className="bg-gray-800 rounded-xl p-6 border border-gray-700"
    >
      <h2 className="text-2xl font-bold text-white mb-6">Engagement Over Time</h2>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
            labelStyle={{ color: '#9CA3AF' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="youtube"
            stroke={PLATFORM_COLORS.youtube}
            strokeWidth={2}
            dot={{ fill: PLATFORM_COLORS.youtube, r: 4 }}
            activeDot={{ r: 6 }}
            name="YouTube"
          />
          <Line
            type="monotone"
            dataKey="instagram"
            stroke={PLATFORM_COLORS.instagram}
            strokeWidth={2}
            dot={{ fill: PLATFORM_COLORS.instagram, r: 4 }}
            activeDot={{ r: 6 }}
            name="Instagram"
          />
          <Line
            type="monotone"
            dataKey="linkedin"
            stroke={PLATFORM_COLORS.linkedin}
            strokeWidth={2}
            dot={{ fill: PLATFORM_COLORS.linkedin, r: 4 }}
            activeDot={{ r: 6 }}
            name="LinkedIn"
          />
          <Line
            type="monotone"
            dataKey="twitter"
            stroke={PLATFORM_COLORS.twitter}
            strokeWidth={2}
            dot={{ fill: PLATFORM_COLORS.twitter, r: 4 }}
            activeDot={{ r: 6 }}
            name="Twitter"
          />
          <Line
            type="monotone"
            dataKey="tiktok"
            stroke={PLATFORM_COLORS.tiktok}
            strokeWidth={2}
            dot={{ fill: PLATFORM_COLORS.tiktok, r: 4 }}
            activeDot={{ r: 6 }}
            name="TikTok"
          />
          <Line
            type="monotone"
            dataKey="facebook"
            stroke={PLATFORM_COLORS.facebook}
            strokeWidth={2}
            dot={{ fill: PLATFORM_COLORS.facebook, r: 4 }}
            activeDot={{ r: 6 }}
            name="Facebook"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
