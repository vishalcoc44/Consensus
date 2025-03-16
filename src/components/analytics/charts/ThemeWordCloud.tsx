
interface ThemeWordCloudProps {
  themes: Array<{
    theme: string;
    keywords: string[];
    occurrences: number;
  }>;
}

const ThemeWordCloud = ({ themes }: ThemeWordCloudProps) => {
  // For now, we'll create a simple visualization since recharts doesn't have a word cloud
  // In production, you might use a dedicated word cloud library
  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-wrap gap-3 justify-center items-center">
        {themes.map((theme, index) => {
          // Calculate size based on occurrences
          const fontSize = Math.max(16, Math.min(36, 16 + theme.occurrences * 6));
          const opacity = Math.max(0.6, Math.min(1, 0.6 + theme.occurrences * 0.1));
          
          // Cycle through different colors
          const colors = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
          const color = colors[index % colors.length];
          
          return (
            <div 
              key={index}
              className="rounded-full px-4 py-2"
              style={{ 
                fontSize: `${fontSize}px`, 
                color,
                opacity,
                fontWeight: fontSize > 24 ? 'bold' : 'normal'
              }}
            >
              {theme.theme}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeWordCloud;
