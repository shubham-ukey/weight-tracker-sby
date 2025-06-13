
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Award, Target } from 'lucide-react';

interface AchievementModalProps {
  achievements: string[];
  onClose: () => void;
}

const AchievementModal: React.FC<AchievementModalProps> = ({ achievements, onClose }) => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const getAchievementIcon = (achievement: string) => {
    if (achievement.includes('KG Lost')) {
      return <Target className="text-green-500" size={48} />;
    }
    if (achievement.includes('Complete')) {
      return <Award className="text-blue-500" size={48} />;
    }
    if (achievement.includes('Goal Achieved')) {
      return <Trophy className="text-yellow-500" size={48} />;
    }
    return <Award className="text-purple-500" size={48} />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-8 text-center relative overflow-hidden">
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="confetti-animation">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random()}s`
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-green-600 mb-2">🎉 Congratulations!</h2>
            <p className="text-gray-600">You've unlocked new achievements!</p>
          </div>

          <div className="space-y-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                {getAchievementIcon(achievement)}
                <div className="text-left">
                  <h3 className="font-semibold text-lg">{achievement}</h3>
                  <p className="text-sm text-gray-600">
                    {achievement.includes('KG Lost') && '+100 points earned!'}
                    {achievement.includes('Complete') && 'Great progress!'}
                    {achievement.includes('Goal Achieved') && 'Amazing work!'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700">
            Continue Journey
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AchievementModal;
