
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User } from 'lucide-react';
import { validateWeight, validateName, sanitizeName } from '@/services/database';

interface UserRegistrationProps {
  mobile: string;
  onRegister: (userData: {
    name: string;
    startWeight: number;
    currentWeight: number;
    targetWeight: number;
  }) => void;
  onBack: () => void;
}

const UserRegistration: React.FC<UserRegistrationProps> = ({ mobile, onRegister, onBack }) => {
  const [name, setName] = useState('');
  const [startWeight, setStartWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    
    if (!validateName(trimmedName)) {
      toast({
        title: "Invalid Name",
        description: "Name must be between 2 and 100 characters",
        variant: "destructive"
      });
      return;
    }

    if (!startWeight || !targetWeight) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const startWeightNum = parseFloat(startWeight);
    const targetWeightNum = parseFloat(targetWeight);

    if (!validateWeight(startWeightNum) || !validateWeight(targetWeightNum)) {
      toast({
        title: "Invalid Weight",
        description: "Weight must be between 30 and 300 kg",
        variant: "destructive"
      });
      return;
    }

    if (targetWeightNum >= startWeightNum) {
      toast({
        title: "Invalid Target",
        description: "Target weight should be less than starting weight",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      onRegister({
        name: sanitizeName(trimmedName),
        startWeight: startWeightNum,
        currentWeight: startWeightNum,
        targetWeight: targetWeightNum
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2 flex items-center justify-center gap-2">
            <User className="text-green-500" />
            Welcome to the Challenge!
          </h1>
          <p className="text-gray-600">Let's set up your profile</p>
          <p className="text-sm text-gray-500 mt-2">Mobile: {mobile}</p>
        </div>

        <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="startWeight">Current Weight (kg)</Label>
              <Input
                id="startWeight"
                type="number"
                step="0.1"
                min="30"
                max="300"
                placeholder="e.g., 75.5"
                value={startWeight}
                onChange={(e) => setStartWeight(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="targetWeight">Target Weight (kg)</Label>
              <Input
                id="targetWeight"
                type="number"
                step="0.1"
                min="30"
                max="300"
                placeholder="e.g., 70.0"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-700 font-medium">Goal:</p>
              <p className="text-sm text-green-600">
                {startWeight && targetWeight ? 
                  `Lose ${(parseFloat(startWeight) - parseFloat(targetWeight)).toFixed(1)} kg in 21 days!` :
                  'Enter your weights to see your goal'
                }
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onBack} className="flex-1" disabled={loading}>
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Start Challenge'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserRegistration;
