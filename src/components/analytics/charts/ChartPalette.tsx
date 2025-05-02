
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { chartColorSchemes } from '@/components/ui/chart';

interface ChartPaletteProps {
  onSelectPalette?: (palette: string) => void;
}

const ChartPalette: React.FC<ChartPaletteProps> = ({ onSelectPalette }) => {
  const paletteNames = Object.keys(chartColorSchemes) as Array<keyof typeof chartColorSchemes>;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chart Color Palettes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paletteNames.map((paletteName) => (
            <div key={paletteName} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="capitalize font-medium">{paletteName}</span>
                {onSelectPalette && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onSelectPalette(paletteName)}
                  >
                    Use
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {chartColorSchemes[paletteName].map((color, i) => (
                  <div 
                    key={`${paletteName}-${i}`}
                    className="h-6 flex-1 rounded-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartPalette;
