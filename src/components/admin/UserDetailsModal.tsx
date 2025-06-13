
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Calendar, TrendingDown } from 'lucide-react';
import { DatabaseUser, WeightEntry } from '@/services/database';
import { getUserWeightEntries, deleteWeightEntry } from '@/services/adminDatabase';

interface UserDetailsModalProps {
  user: DatabaseUser;
  onClose: () => void;
  onUserUpdate: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, onClose, onUserUpdate }) => {
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadWeightEntries();
  }, [user.id]);

  const loadWeightEntries = async () => {
    try {
      setLoading(true);
      const entries = await getUserWeightEntries(user.id);
      setWeightEntries(entries);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load weight entries",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this weight entry?')) {
      return;
    }

    try {
      await deleteWeightEntry(entryId);
      loadWeightEntries();
      onUserUpdate();
      toast({
        title: "Entry Deleted",
        description: "Weight entry has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete weight entry",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingDown className="text-blue-500" />
            {user.name} - Detailed View
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-600">Mobile</p>
              <p className="font-semibold">{user.mobile}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-600">Start Weight</p>
              <p className="font-semibold">{user.start_weight} kg</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-sm text-orange-600">Current Weight</p>
              <p className="font-semibold">{user.current_weight} kg</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-sm text-purple-600">Target Weight</p>
              <p className="font-semibold">{user.target_weight} kg</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm text-red-600">Weight Lost</p>
              <p className="font-semibold">{(user.start_weight - user.current_weight).toFixed(1)} kg</p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg">
              <p className="text-sm text-indigo-600">Points Earned</p>
              <p className="font-semibold">{user.points || 0} pts</p>
            </div>
            <div className="bg-teal-50 p-3 rounded-lg">
              <p className="text-sm text-teal-600">Join Date</p>
              <p className="font-semibold">{formatDate(user.join_date)}</p>
            </div>
          </div>

          {/* Weight History */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-green-500" size={20} />
              <h3 className="text-lg font-semibold">Weight History</h3>
            </div>

            {loading ? (
              <p className="text-center text-gray-500 py-4">Loading weight entries...</p>
            ) : weightEntries.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No weight entries found</p>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weightEntries.map((entry, index) => {
                      const previousWeight = index < weightEntries.length - 1 ? weightEntries[index + 1].weight : user.start_weight;
                      const change = entry.weight - previousWeight;
                      
                      return (
                        <TableRow key={entry.id}>
                          <TableCell>{formatDate(entry.recorded_date)}</TableCell>
                          <TableCell>{entry.weight} kg</TableCell>
                          <TableCell>
                            {change !== 0 && (
                              <Badge variant={change < 0 ? "default" : "destructive"}>
                                {change > 0 ? '+' : ''}{change.toFixed(1)} kg
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteEntry(entry.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
