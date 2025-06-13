
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';
import { adminLogin, setAdminSession } from '@/services/adminAuth';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!mobile) {
      toast({
        title: "Missing Information",
        description: "Please enter mobile number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const admin = await adminLogin(mobile);
      setAdminSession(admin);
      toast({
        title: "Login Successful",
        description: "Welcome to Admin Dashboard",
      });
      navigate('/admin');
    } catch (error) {
      toast({
        title: "Access Denied",
        description: error instanceof Error ? error.message : "Invalid mobile number",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-600 mb-2 flex items-center justify-center gap-2">
            <Shield className="text-red-500" />
            Admin Login
          </h1>
          <p className="text-gray-600 text-lg">21-Day Challenge Administration</p>
        </div>

        <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <div className="space-y-4">
            <div>
              <Label htmlFor="mobile">Admin Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="Enter admin mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
                className="mt-1"
              />
            </div>

            <Button 
              onClick={handleLogin}
              className="w-full py-3 text-lg bg-red-600 hover:bg-red-700"
              disabled={mobile.length !== 10 || loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="text-sm"
          >
            Back to Main App
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

