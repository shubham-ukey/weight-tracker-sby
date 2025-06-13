
export interface User {
  id: string;
  mobile: string;
  name: string;
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  points: number;
  achievements: string[];
  weightHistory: Array<{ date: string; weight: number }>;
  joinDate: string;
}

export const convertDatabaseUserToUser = (dbUser: any, achievements: any[], weightHistory: any[]): User => {
  return {
    id: dbUser.id,
    mobile: dbUser.mobile,
    name: dbUser.name,
    startWeight: dbUser.start_weight,
    currentWeight: dbUser.current_weight,
    targetWeight: dbUser.target_weight,
    points: dbUser.points,
    achievements: achievements.map(a => `${a.achievement_value}${a.achievement_type === 'kg-lost' ? 'kg-lost' : a.achievement_type === 'percent-complete' ? '%-complete' : ''}`),
    weightHistory: weightHistory.map(w => ({
      date: w.recorded_date,
      weight: w.weight
    })),
    joinDate: dbUser.join_date
  };
};
