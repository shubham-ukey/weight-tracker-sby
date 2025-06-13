import { supabase } from '@/integrations/supabase/client';

export interface DatabaseUser {
  id: string;
  mobile: string;
  name: string;
  start_weight: number;
  current_weight: number;
  target_weight: number;
  points: number;
  join_date: string;
  created_at: string;
  updated_at: string;
}

export interface WeightEntry {
  id: string;
  user_id: string;
  weight: number;
  recorded_date: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_value: string;
  earned_at: string;
}

// Input validation functions
export const validateMobile = (mobile: string): boolean => {
  return /^[0-9]{10}$/.test(mobile);
};

export const validateWeight = (weight: number): boolean => {
  return weight >= 30 && weight <= 300;
};

export const validateName = (name: string): boolean => {
  const trimmedName = name.trim();
  return trimmedName.length >= 2 && trimmedName.length <= 100;
};

export const sanitizeName = (name: string): string => {
  return name.trim().replace(/[<>\"'&]/g, '');
};

// Database operations
export const getUserByMobile = async (mobile: string): Promise<DatabaseUser | null> => {
  if (!validateMobile(mobile)) {
    throw new Error('Invalid mobile number format');
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('mobile', mobile)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user:', error);
    throw new Error('Failed to fetch user data');
  }

  return data;
};

export const createUser = async (userData: {
  mobile: string;
  name: string;
  start_weight: number;
  target_weight: number;
}): Promise<DatabaseUser> => {
  // Validate all inputs
  if (!validateMobile(userData.mobile)) {
    throw new Error('Invalid mobile number format');
  }
  if (!validateName(userData.name)) {
    throw new Error('Name must be between 2 and 100 characters');
  }
  if (!validateWeight(userData.start_weight)) {
    throw new Error('Start weight must be between 30 and 300 kg');
  }
  if (!validateWeight(userData.target_weight)) {
    throw new Error('Target weight must be between 30 and 300 kg');
  }
  if (userData.target_weight >= userData.start_weight) {
    throw new Error('Target weight must be less than start weight');
  }

  const sanitizedName = sanitizeName(userData.name);

  const { data, error } = await supabase
    .from('users')
    .insert([{
      mobile: userData.mobile,
      name: sanitizedName,
      start_weight: userData.start_weight,
      current_weight: userData.start_weight,
      target_weight: userData.target_weight
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    if (error.code === '23505') {
      throw new Error('Mobile number already registered');
    }
    throw new Error('Failed to create user');
  }

  // Create initial weight entry
  await supabase
    .from('weight_history')
    .insert([{
      user_id: data.id,
      weight: userData.start_weight
    }]);

  return data;
};

export const updateUserWeight = async (userId: string, newWeight: number): Promise<{ user: DatabaseUser; weightEntry: WeightEntry }> => {
  if (!validateWeight(newWeight)) {
    throw new Error('Weight must be between 30 and 300 kg');
  }

  // First, update current weight in users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .update({ current_weight: newWeight })
    .eq('id', userId)
    .select()
    .single();

  if (userError) {
    console.error('Error updating user weight:', userError);
    throw new Error('Failed to update weight');
  }

  // Then add weight history entry (this will trigger the points calculation)
  const { data: weightData, error: weightError } = await supabase
    .from('weight_history')
    .insert([{
      user_id: userId,
      weight: newWeight
    }])
    .select()
    .single();

  if (weightError) {
    console.error('Error adding weight history:', weightError);
    if (weightError.code === '23505') {
      // Update existing entry for today
      const { data: updateData, error: updateError } = await supabase
        .from('weight_history')
        .update({ weight: newWeight })
        .eq('user_id', userId)
        .eq('recorded_date', new Date().toISOString().split('T')[0])
        .select()
        .single();

      if (updateError) {
        throw new Error('Failed to update weight history');
      }
      
      // Get updated user data after points calculation
      const { data: finalUserData, error: finalUserError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (finalUserError) {
        throw new Error('Failed to fetch updated user data');
      }

      return { user: finalUserData, weightEntry: updateData };
    }
    throw new Error('Failed to add weight history');
  }

  // Get updated user data after points calculation (trigger should have updated points)
  const { data: finalUserData, error: finalUserError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (finalUserError) {
    throw new Error('Failed to fetch updated user data');
  }

  return { user: finalUserData, weightEntry: weightData };
};

export const getUserWeightHistory = async (userId: string): Promise<WeightEntry[]> => {
  const { data, error } = await supabase
    .from('weight_history')
    .select('*')
    .eq('user_id', userId)
    .order('recorded_date', { ascending: false });

  if (error) {
    console.error('Error fetching weight history:', error);
    throw new Error('Failed to fetch weight history');
  }

  return data || [];
};

export const getUserAchievements = async (userId: string): Promise<Achievement[]> => {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) {
    console.error('Error fetching achievements:', error);
    throw new Error('Failed to fetch achievements');
  }

  return data || [];
};

export const getAllUsers = async (): Promise<DatabaseUser[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('points', { ascending: false });

  if (error) {
    console.error('Error fetching all users:', error);
    throw new Error('Failed to fetch users');
  }

  return data || [];
};

export const getNewAchievements = async (userId: string, lastCheckTime: string): Promise<Achievement[]> => {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .gte('earned_at', lastCheckTime)
    .order('earned_at', { ascending: false });

  if (error) {
    console.error('Error fetching new achievements:', error);
    return [];
  }

  return data || [];
};
