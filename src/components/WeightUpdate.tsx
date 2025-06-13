
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Target, TrendingDown, Award, Users, TrendingUp } from 'lucide-react';
import { User } from '@/types/database';
import AchievementModal from './AchievementModal';
import { updateUserWeight, getUserAchievements, getNewAchievements, validateWeight } from '@/services/database';
import { convertDatabaseUserToUser } from '@/types/database';

interface WeightUpdateProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
  onBack: () => void;
  onShowLeaderboard: () => void;
}

const WeightUpdate: React.FC<WeightUpdateProps> = ({ user, onUpdate, onBack, onShowLeaderboard }) => {
  const [newWeight, setNewWeight] = useState('');
  const [showAchievement, setShowAchievement] = useState(false);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastCheckTime] = useState(new Date().toISOString());
  const { toast } = useToast();

  const totalLoss = user.startWeight - user.currentWeight;
  const goalLoss = user.startWeight - user.targetWeight;
  const progressPercentage = Math.min(Math.max((totalLoss / goalLoss) * 100, 0), 100);
  const daysElapsed = Math.floor((new Date().getTime() - new Date(user.joinDate).getTime()) / (1000 * 60 * 60 * 24));
  const isWeightGain = totalLoss < 0;

  const handleWeightUpdate = async () => {
    const newWeightNum = parseFloat(newWeight);
    
    if (!newWeight || !validateWeight(newWeightNum)) {
      toast({
        title: "Invalid Weight",
        description: "Please enter a valid weight between 30-300 kg",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Updating weight for user:', user.id, 'to:', newWeightNum);
      
      // Update weight in database
      const { user: updatedDbUser } = await updateUserWeight(user.id, newWeightNum);
      console.log('Weight updated successfully, new user data:', updatedDbUser);

      // Check for new achievements only if weight was lost
      let achievements = [];
      if (newWeightNum <= user.startWeight) {
        achievements = await getNewAchievements(user.id, lastCheckTime);
        console.log('New achievements found:', achievements);
      }
      
      // Fetch all achievements and weight history for the updated user
      const [allAchievements] = await Promise.all([
        getUserAchievements(user.id)
      ]);

      // Convert to UI format
      const updatedUser = convertDatabaseUserToUser(updatedDbUser, allAchievements, user.weightHistory);
      console.log('Converted user data:', updatedUser);
      
      // Update the user in parent component
      onUpdate(updatedUser);

      // Show achievement modal if there are new achievements
      if (achievements.length > 0) {
        const achievementTitles = achievements.map(a => {
          if (a.achievement_type === 'kg-lost') {
            return `${a.achievement_value} KG Lost!`;
          }
          if (a.achievement_type === 'percent-complete') {
            return `${a.achievement_value}% Complete!`;
          }
          if (a.achievement_type === 'goal-achieved') {
            return 'Goal Achieved!';
          }
          return a.achievement_value;
        });
        setNewAchievements(achievementTitles);
        setShowAchievement(true);
      }

      const weightChange = newWeightNum - user.currentWeight;
      const weightChangeText = weightChange > 0 ? `gained ${weightChange.toFixed(1)} kg` : `lost ${Math.abs(weightChange).toFixed(1)} kg`;
      
      toast({
        title: "Weight Updated Successfully! 🎉",
        description: `Your weight has been updated to ${newWeightNum} kg. You ${weightChangeText}. You now have ${updatedUser.points} points!`,
      });

      setNewWeight('');
    } catch (error) {
      console.error('Error updating weight:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update weight",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getAchievementTitle = (achievement: string) => {
    if (achievement.includes('kg-lost')) {
      const kg = achievement.split('kg-lost')[0];
      return `${kg} KG Lost!`;
    }
    if (achievement.includes('%-complete')) {
      const percent = achievement.split('%-complete')[0];
      return `${percent}% Complete!`;
    }
    if (achievement === 'goal-achieved') {
      return 'Goal Achieved!';
    }
    return achievement;
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-green-600">Hey {user.name}! 👋</h1>
            <p className="text-gray-600">Day {daysElapsed + 1} of your 21-day journey</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onShowLeaderboard} size="sm">
              <Users size={16} className="mr-1" />
              Leaderboard
            </Button>
            <Button variant="outline" onClick={onBack} size="sm">
              Exit
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className={`p-4 ${isWeightGain ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-gradient-to-r from-green-500 to-green-600'} text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${isWeightGain ? 'text-orange-100' : 'text-green-100'} text-sm`}>
                  {isWeightGain ? 'Weight Gained' : 'Weight Lost'}
                </p>
                <p className="text-2xl font-bold">{Math.abs(totalLoss).toFixed(1)} kg</p>
              </div>
              {isWeightGain ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Points Earned</p>
                <p className="text-2xl font-bold">{user.points}</p>
              </div>
              <Award size={24} />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Current Weight</p>
                <p className="text-2xl font-bold">{user.currentWeight} kg</p>
              </div>
              <Target size={24} />
            </div>
          </Card>
        </div>

        {/* Progress Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="text-yellow-500" />
            <h2 className="text-xl font-semibold">Your Progress</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress to Goal</span>
                <span>{progressPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              {isWeightGain && (
                <p className="text-sm text-orange-600 mt-2">
                  💪 Keep going! Every step counts in your journey.
                </p>
              )}
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Start: {user.startWeight} kg</span>
              <span>Target: {user.targetWeight} kg</span>
            </div>
          </div>
        </Card>

        {/* Achievements */}
        {user.achievements.length > 0 && (
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="text-purple-500" />
              <h2 className="text-xl font-semibold">Your Achievements</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {user.achievements.map((achievement, index) => (
                <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-700">
                  {getAchievementTitle(achievement)}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Weight Update */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Update Your Weight</h2>
          <div className="flex gap-3">
            <Input
              type="number"
              step="0.1"
              min="30"
              max="300"
              placeholder="Enter current weight (kg)"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              className="flex-1"
              disabled={loading}
            />
            <Button 
              onClick={handleWeightUpdate} 
              className="bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update'}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            💡 Tip: Track your progress honestly - both gains and losses help you stay on track
          </p>
        </Card>

        {showAchievement && (
          <AchievementModal
            achievements={newAchievements}
            onClose={() => setShowAchievement(false)}
          />
        )}
      </div>
    </div>
  );
};

export default WeightUpdate;
