
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface WelcomeMessageProps {
  userName?: string;
  onDismiss: () => void;
}

const WelcomeMessage = ({ userName = 'there', onDismiss }: WelcomeMessageProps) => {
  const [currentTip, setCurrentTip] = useState(0);
  
  const tips = [
    {
      title: 'Create Your First Decision',
      content: 'Start by creating a decision. Simply click on the "New Decision" button to get started with your first collaborative decision-making process.'
    },
    {
      title: 'Invite Team Members',
      content: 'Collaborative decisions work best with diverse input. Invite your team members to join in and contribute their perspective.'
    },
    {
      title: 'Define Clear Criteria',
      content: 'Set up evaluation criteria to ensure all options are assessed against the same standards. This leads to more objective decisions.'
    }
  ];
  
  // Auto-rotate tips every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [tips.length]);
  
  return (
    <Card className="border-consensus-green/20 bg-gradient-to-br from-white to-consensus-green/5">
      <CardHeader className="relative pb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-2" 
          onClick={onDismiss}
        >
          <X size={16} />
          <span className="sr-only">Dismiss</span>
        </Button>
        <CardTitle>Welcome, {userName}!</CardTitle>
        <CardDescription>
          Get started with ConsensusAI in just a few steps
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="min-h-[80px]">
          <h3 className="font-medium text-lg mb-1">{tips[currentTip].title}</h3>
          <p className="text-consensus-grey-600">{tips[currentTip].content}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2">
        <div className="flex space-x-1">
          {tips.map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentTip ? "w-6 bg-consensus-green" : "w-2 bg-consensus-grey-300"
              }`}
              onClick={() => setCurrentTip(index)}
              aria-label={`Tip ${index + 1}`}
            />
          ))}
        </div>
        <Button variant="link" onClick={onDismiss}>
          Don't show again
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WelcomeMessage;
