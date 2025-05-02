
import { useMemo } from 'react';
import { useIsDarkMode } from '@/hooks/useMediaQuery';
import { chartColorSchemes } from '@/components/ui/chart/index';

export type ChartThemeType = 'default' | 'cool' | 'warm' | 'pastel' | 'monochrome';
export type ChartSizeType = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Custom hook for consistent chart theming throughout the application
 */
export function useChartTheme(themeType: ChartThemeType = 'default', size: ChartSizeType = 'md') {
  const isDarkMode = useIsDarkMode();
  
  // Return appropriate colors based on theme type and dark/light mode
  const colors = useMemo(() => {
    // Use color scheme from chart component
    const baseColors = chartColorSchemes[themeType] || chartColorSchemes.default;
    
    // Adjust colors for dark mode if necessary
    if (isDarkMode && themeType === 'default') {
      // Slightly brighten default colors for dark mode
      return baseColors.map(color => {
        // This is a simple brightening for demo purposes
        return color; // In real implementation, we could adjust the brightness
      });
    }
    
    return baseColors;
  }, [themeType, isDarkMode]);
  
  // Get chart dimensions based on size
  const dimensions = useMemo(() => {
    switch (size) {
      case 'sm':
        return { 
          height: 220, 
          margin: { top: 10, right: 10, bottom: 30, left: 40 },
          fontSize: 11
        };
      case 'lg':
        return { 
          height: 400, 
          margin: { top: 20, right: 20, bottom: 40, left: 60 },
          fontSize: 13
        };
      case 'xl':
        return { 
          height: 500, 
          margin: { top: 20, right: 30, bottom: 50, left: 70 },
          fontSize: 14
        };
      case 'md':
      default:
        return { 
          height: 300, 
          margin: { top: 15, right: 15, bottom: 35, left: 50 },
          fontSize: 12
        };
    }
  }, [size]);
  
  // Generate consistent style properties for charts
  const chartStyle = useMemo(() => ({
    colors,
    fontSize: dimensions.fontSize,
    fontFamily: "'Inter', sans-serif",
    tickColor: isDarkMode ? '#666' : '#ccc',
    gridColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    tooltipBackground: isDarkMode ? 'rgba(26, 32, 44, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    tooltipBorder: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)',
    textColor: isDarkMode ? '#e2e8f0' : '#2d3748'
  }), [colors, dimensions.fontSize, isDarkMode]);
  
  return {
    colors,
    dimensions,
    chartStyle
  };
}
