import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users, RotateCcw, LogOut } from 'lucide-react';
import { getAdminSession, clearAdminSession } from '@/services/adminAuth';
import { getAllUsersWithDetails, resetAllData } from '@/services/adminDatabase';
import { DatabaseUser } from '@/services/database';
import { useNavigate } from 'react-router-dom';
import UserManagement from '@/components/admin/UserManagement';
import AdminStats from '@/components/admin/AdminStats';

const AdminDashboard = () => {
  const [users, setUsers] = useState<DatabaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [admin, setAdmin] = useState<any>(null); // Add your admin type if available
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const session = getAdminSession();
    if (!session) {
      console.log('No admin session found, redirecting to login');
      navigate('/admin/login');
    } else {
      console.log('Admin session found:', session);
      setAdmin(session);
    }
  }, [navigate]);

  useEffect(() => {
    if (admin) {
      loadUsers();
    }
  }, [admin]);

  const loadUsers = async () => {
    try {
      console.log('Starting to load users...');
      setLoading(true);
      setError(null);
      const usersData = await getAllUsersWithDetails();
      console.log('Users loaded successfully:', usersData);
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error loading users:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load users";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all data? This will delete ALL users, weight entries, and achievements. This action cannot be undone.')) {
      return;
    }

    setResetting(true);
    try {
      await resetAllData();
      setUsers([]);
      toast({
        title: "Reset Successful",
        description: "All data has been cleared. Challenge can start fresh!",
      });
    } catch (error) {
      console.error('Reset failed:', error);
      toast({
        title: "Reset Failed",
        description: error instanceof Error ? error.message : "Failed to reset data",
        variant: "destructive"
      });
    } finally {
      setResetting(false);
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    navigate('/admin/login');
  };

  const handleUsersChange = () => {
    loadUsers();
  };

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Shield className="text-red-500" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-red-600">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome, {admin.name}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleReset}
              variant="destructive"
              disabled={resetting}
              className="flex items-center gap-2"
            >
              <RotateCcw size={16} />
              {resetting ? 'Resetting...' : 'Reset All Data'}
            </Button>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AdminStats users={users} />
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-blue-500" size={24} />
            <h2 className="text-2xl font-semibold">User Management</h2>
          </div>
          
          <UserManagement 
            users={users} 
            loading={loading}
            error={error}
            onUsersChange={handleUsersChange} 
            onRetry={loadUsers}
          />
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
