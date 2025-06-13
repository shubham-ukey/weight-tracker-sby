
import { supabase } from '@/integrations/supabase/client';
import { DatabaseUser, WeightEntry, Achievement } from '@/services/database';

export const getAllUsersWithDetails = async (): Promise<DatabaseUser[]> => {
  console.log('Fetching all users with details...');
  
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  console.log('Users query result:', { users, error });

  if (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users: ' + error.message);
  }

  if (!users) {
    console.log('No users found');
    return [];
  }

  console.log('Successfully fetched users:', users.length);
  return users;
};

export const deleteUser = async (userId: string): Promise<void> => {
  console.log('Deleting user:', userId);
  
  // Delete user (cascading will handle weight_history and achievements)
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user: ' + error.message);
  }

  console.log('User deleted successfully');
};

export const updateUser = async (userId: string, updates: Partial<DatabaseUser>): Promise<void> => {
  console.log('Updating user:', userId, updates);
  
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user: ' + error.message);
  }

  console.log('User updated successfully');
};

export const getUserWeightEntries = async (userId: string): Promise<WeightEntry[]> => {
  console.log('Fetching weight entries for user:', userId);
  
  const { data, error } = await supabase
    .from('weight_history')
    .select('*')
    .eq('user_id', userId)
    .order('recorded_date', { ascending: false });

  console.log('Weight entries query result:', { data, error });

  if (error) {
    console.error('Error fetching weight entries:', error);
    throw new Error('Failed to fetch weight entries: ' + error.message);
  }

  return data || [];
};

export const deleteWeightEntry = async (entryId: string): Promise<void> => {
  console.log('Deleting weight entry:', entryId);
  
  const { error } = await supabase
    .from('weight_history')
    .delete()
    .eq('id', entryId);

  if (error) {
    console.error('Error deleting weight entry:', error);
    throw new Error('Failed to delete weight entry: ' + error.message);
  }

  console.log('Weight entry deleted successfully');
};

export const resetAllData = async (): Promise<void> => {
  console.log('Starting data reset...');
  
  // Delete all achievements first
  const { error: achievementsError } = await supabase
    .from('achievements')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (achievementsError) {
    console.error('Error deleting achievements:', achievementsError);
    throw new Error('Failed to delete achievements: ' + achievementsError.message);
  }

  // Delete all weight history
  const { error: weightError } = await supabase
    .from('weight_history')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (weightError) {
    console.error('Error deleting weight history:', weightError);
    throw new Error('Failed to delete weight history: ' + weightError.message);
  }

  // Delete all users
  const { error: usersError } = await supabase
    .from('users')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (usersError) {
    console.error('Error deleting users:', usersError);
    throw new Error('Failed to delete users: ' + usersError.message);
  }

  console.log('Data reset completed successfully');
};
