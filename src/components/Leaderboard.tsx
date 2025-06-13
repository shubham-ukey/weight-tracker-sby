
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';
import { useUsers } from '@/hooks/useDatabase';
import { useToast } from '@/hooks/use-toast';

const Leaderboard: React.FC = () => {
  const { users, loading, error } = useUsers();
  const { toast } = useToast();

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error Loading Leaderboard",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const rankedUsers = users
    .map(user => ({
      ...user,
      weightLost: user.start_weight - user.current_weight,
      progressPercentage: ((user.start_weight - user.current_weight) / (user.start_weight - user.target_weight)) * 100
    }))
    .sort((a, b) => b.weightLost - a.weightLost);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-500" size={24} />;
      case 2:
        return <Medal className="text-gray-400" size={24} />;
      case 3:
        return <Medal className="text-orange-600" size={24} />;
      default:
        return <Award className="text-blue-500" size={20} />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500 text-white';
      case 2:
        return 'bg-gray-400 text-white';
      case 3:
        return 'bg-orange-600 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">Loading leaderboard...</h2>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">No participants yet!</h2>
        <p className="text-gray-500">Be the first to join the 21-day challenge!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {rankedUsers.map((user, index) => {
        const rank = index + 1;
        return (
          <Card key={user.id} className={`p-4 ${rank <= 3 ? 'border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {getRankIcon(rank)}
                  <Badge className={getRankBadgeColor(rank)}>
                    #{rank}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-sm text-gray-600">
                    {user.weightLost.toFixed(1)} kg lost • {user.points} points
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-500">Progress:</span>
                  <Badge variant="outline">
                    {Math.min(user.progressPercentage, 100).toFixed(1)}%
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-600">
                  {user.current_weight} kg / {user.target_weight} kg
                </div>
              </div>
            </div>
          </Card>
        );
      })}

      <Card className="p-6 bg-green-50">
        <h3 className="font-semibold text-green-700 mb-2">🎯 Challenge Stats</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Participants:</span>
            <div className="font-semibold">{users.length}</div>
          </div>
          <div>
            <span className="text-gray-600">Total Weight Lost:</span>
            <div className="font-semibold">{rankedUsers.reduce((sum, user) => sum + user.weightLost, 0).toFixed(1)} kg</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Leaderboard;
