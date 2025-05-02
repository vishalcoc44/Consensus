
import * as React from "react";

export type { ChartConfig } from "./chart-context";
export { ChartContainer } from "./chart-container";
export { ChartTooltip, ChartTooltipContent } from "./chart-tooltip";
export { ChartLegend, ChartLegendContent } from "./chart-legend";
export { ChartStyle } from "./chart-style";

// Export a helper function to animate charts with more configuration options
export const useChartAnimation = () => {
  const [animated, setAnimated] = React.useState(false);
  
  React.useEffect(() => {
    // Delay animation slightly for better visual effect
    const timer = setTimeout(() => {
      setAnimated(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  const getAnimationProps = (index = 0, customConfig = {}) => ({
    isAnimationActive: true,
    animationBegin: 100 + (index * 150),
    animationDuration: 1000,
    animationEasing: "ease-out",
    ...customConfig
  });

  // Get animation for specific chart types
  const getBarAnimationProps = (index = 0) => ({
    ...getAnimationProps(index),
    animationEasing: "cubic-bezier(0.2, 0.8, 0.2, 1)"
  });
  
  const getPieAnimationProps = (index = 0) => ({
    ...getAnimationProps(index),
    animationDuration: 1200,
    animationEasing: "ease-out"
  });

  const getLineAnimationProps = (index = 0) => ({
    ...getAnimationProps(index),
    animationDuration: 1500,
    animationEasing: "ease-in-out"
  });
  
  return { 
    animated, 
    getAnimationProps,
    getBarAnimationProps,
    getPieAnimationProps,
    getLineAnimationProps
  };
};

// Export responsive container config with more device-specific options
export const responsiveConfig = {
  width: '100%',
  height: 300,
  minWidth: 300,
  minHeight: 250
};

// Export responsive breakpoints for different chart sizes
export const chartBreakpoints = {
  sm: {
    width: '100%',
    height: 220,
  },
  md: {
    width: '100%',
    height: 300,
  },
  lg: {
    width: '100%',
    height: 400,
  }
};

// Helper function to format numbers in charts
export const formatChartValue = (value: number, format: 'number' | 'currency' | 'percent' = 'number') => {
  if (format === 'currency') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }
  
  if (format === 'percent') {
    return `${value}%`;
  }
  
  return new Intl.NumberFormat('en-US').format(value);
};

// Helper for creating chart color schemes
export const chartColorSchemes = {
  default: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  cool: ['#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e'],
  warm: ['#f97316', '#f59e0b', '#eab308', '#a3e635', '#84cc16'],
  pastel: ['#a5b4fc', '#bae6fd', '#a7f3d0', '#fef08a', '#fed7aa']
};
