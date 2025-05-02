
import React from 'react';
import { ResponsiveContainer } from 'recharts';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface ChartResponsiveProps {
  children: React.ReactNode;
  minHeight?: number;
  aspectRatio?: number;
  className?: string;
}

/**
 * A responsive container with built-in media query handling for charts
 */
export const ChartResponsive: React.FC<ChartResponsiveProps> = ({ 
  children, 
  minHeight = 250, 
  aspectRatio = 16/9,
  className
}) => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
  
  // Adjust height based on device
  const height = isMobile ? 220 : isTablet ? 300 : 350;
  
  return (
    <div className={className} style={{ 
      width: '100%', 
      height: Math.max(minHeight, height),
      aspectRatio: aspectRatio.toString(),
      margin: '0 auto'
    }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
};

/**
 * A responsive container specifically for pie/donut charts with aspect ratio closer to 1:1
 */
export const PieChartResponsive: React.FC<Omit<ChartResponsiveProps, 'aspectRatio'>> = (props) => {
  return <ChartResponsive {...props} aspectRatio={4/3} />;
};
