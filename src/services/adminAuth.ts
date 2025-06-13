import { supabase } from '@/integrations/supabase/client';

export interface AdminUser {
  id: string;
  mobile: string;
  name: string;
  created_at: string;
}

export const adminLogin = async (mobile: string): Promise<AdminUser> => {
  console.log('Attempting admin login for mobile:', mobile);
  
  // Check if the mobile number is the admin number
  if (mobile !== '9929785595') {
    console.log('Not an admin mobile number:', mobile);
    throw new Error('Access denied');
  }

  // Create a mock admin user since we're not using database authentication
  const adminUser: AdminUser = {
    id: 'admin-user-id',
    mobile: '9929785595',
    name: 'Admin User',
    created_at: new Date().toISOString()
  };

  console.log('Admin login successful');
  return adminUser;
};

export const isAdminAuthenticated = (): boolean => {
  const adminSession = localStorage.getItem('adminSession');
  return !!adminSession;
};

export const getAdminSession = (): AdminUser | null => {
  const adminSession = localStorage.getItem('adminSession');
  if (!adminSession) return null;
  
  try {
    return JSON.parse(adminSession);
  } catch {
    localStorage.removeItem('adminSession');
    return null;
  }
};

export const setAdminSession = (admin: AdminUser): void => {
  localStorage.setItem('adminSession', JSON.stringify(admin));
};

export const clearAdminSession = (): void => {
  localStorage.removeItem('adminSession');
};
