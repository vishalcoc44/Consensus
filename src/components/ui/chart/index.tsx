
import * as React from "react";

export type { ChartConfig } from "./chart-context";
export { ChartContainer } from "./chart-container";
export { ChartTooltip, ChartTooltipContent } from "./chart-tooltip";
export { ChartLegend, ChartLegendContent } from "./chart-legend";
export { ChartStyle } from "./chart-style";

// Export a helper function to animate charts
export const useChartAnimation = () => {
  const [animated, setAnimated] = React.useState(false);
  
  React.useEffect(() => {
    // Delay animation slightly for better visual effect
    const timer = setTimeout(() => {
      setAnimated(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  const getAnimationProps = (index = 0) => ({
    isAnimationActive: true,
    animationBegin: 100 + (index * 150),
    animationDuration: 1000,
    animationEasing: "ease-out"
  });
  
  return { animated, getAnimationProps };
};

// Export responsive container config for better display on different devices
export const responsiveConfig = {
  width: '100%',
  height: 300,
  minWidth: 300,
  minHeight: 250
};
