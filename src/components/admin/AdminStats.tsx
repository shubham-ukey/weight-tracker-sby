
import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, Target, TrendingDown } from 'lucide-react';
import { DatabaseUser } from '@/services/database';

interface AdminStatsProps {
  users: DatabaseUser[];
}

const AdminStats: React.FC<AdminStatsProps> = ({ users }) => {
  const totalUsers = users.length;
  const totalWeightLost = users.reduce((sum, user) => sum + (user.start_weight - user.current_weight), 0);
  const totalPoints = users.reduce((sum, user) => sum + (user.points || 0), 0);

  return (
    <>
      <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="flex items-center gap-3">
          <Users size={32} />
          <div>
            <p className="text-blue-100">Total Users</p>
            <p className="text-3xl font-bold">{totalUsers}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="flex items-center gap-3">
          <TrendingDown size={32} />
          <div>
            <p className="text-green-100">Total Weight Lost</p>
            <p className="text-3xl font-bold">{totalWeightLost.toFixed(1)} kg</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <div className="flex items-center gap-3">
          <Target size={32} />
          <div>
            <p className="text-purple-100">Total Points</p>
            <p className="text-3xl font-bold">{totalPoints}</p>
          </div>
        </div>
      </Card>
    </>
  );
};

export default AdminStats;
