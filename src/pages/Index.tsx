
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import UserRegistration from '@/components/UserRegistration';
import WeightUpdate from '@/components/WeightUpdate';
import Leaderboard from '@/components/Leaderboard';
import { Trophy, Target, Users } from 'lucide-react';
import { getUserByMobile, validateMobile } from '@/services/database';
import { User } from '@/types/database';

const Index = () => {
  const [mobile, setMobile] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load user from localStorage on app start to maintain session
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setMobile(user.mobile);
      } catch (error) {
        console.error('Error loading saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  // Save user to localStorage whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const handleMobileSubmit = async () => {
    if (!validateMobile(mobile)) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const existingUser = await getUserByMobile(mobile);
      if (existingUser) {
        // Convert database user to UI user format
        const { getUserAchievements, getUserWeightHistory } = await import('@/services/database');
        const [achievements, weightHistory] = await Promise.all([
          getUserAchievements(existingUser.id),
          getUserWeightHistory(existingUser.id)
        ]);
        
        const { convertDatabaseUserToUser } = await import('@/types/database');
        const user = convertDatabaseUserToUser(existingUser, achievements, weightHistory);
        setCurrentUser(user);
        setIsNewUser(false);
      } else {
        setIsNewUser(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch user data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserRegistration = async (userData: Omit<User, 'id' | 'mobile' | 'points' | 'achievements' | 'weightHistory' | 'joinDate'>) => {
    try {
      const { createUser } = await import('@/services/database');
      const newUser = await createUser({
        mobile,
        name: userData.name,
        start_weight: userData.startWeight,
        target_weight: userData.targetWeight
      });

      const { convertDatabaseUserToUser } = await import('@/types/database');
      const user = convertDatabaseUserToUser(newUser, [], [{ recorded_date: newUser.join_date, weight: newUser.start_weight }]);
      setCurrentUser(user);
      setIsNewUser(false);
      
      toast({
        title: "Registration Successful!",
        description: "Welcome to the 21-day challenge!",
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register user",
        variant: "destructive"
      });
    }
  };

  const handleWeightUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  const resetApp = () => {
    setMobile('');
    setCurrentUser(null);
    setIsNewUser(false);
    setShowLeaderboard(false);
    localStorage.removeItem('currentUser');
  };

  if (showLeaderboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-green-600 flex items-center gap-2">
              <Trophy className="text-yellow-500" />
              21-Day Challenge Leaderboard
            </h1>
            <Button onClick={() => setShowLeaderboard(false)} variant="outline">
              Back to Tracker
            </Button>
          </div>
          <Leaderboard />
        </div>
      </div>
    );
  }

  if (isNewUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <UserRegistration 
          mobile={mobile} 
          onRegister={handleUserRegistration}
          onBack={() => setIsNewUser(false)}
        />
      </div>
    );
  }

  if (currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <WeightUpdate 
          user={currentUser} 
          onUpdate={handleWeightUpdate}
          onBack={resetApp}
          onShowLeaderboard={() => setShowLeaderboard(true)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-600 mb-2 flex items-center justify-center gap-2">
            <Target className="text-green-500" />
            21-Day Challenge
          </h1>
          <p className="text-gray-600 text-lg">Transform your life in 21 days!</p>
        </div>

        <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your mobile number to get started
              </label>
              <Input
                type="tel"
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
                className="text-lg py-3"
              />
            </div>
            <Button 
              onClick={handleMobileSubmit}
              className="w-full py-3 text-lg bg-green-600 hover:bg-green-700"
              disabled={mobile.length !== 10 || loading}
            >
              {loading ? 'Loading...' : 'Continue'}
            </Button>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <Button 
            variant="outline" 
            onClick={() => setShowLeaderboard(true)}
            className="flex items-center gap-2"
          >
            <Users size={20} />
            View Leaderboard
          </Button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>🎯 Earn 100 points for every kg lost!</p>
          <p>🏆 Compete with others and win badges!</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
