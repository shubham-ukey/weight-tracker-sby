
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, Eye, Save, X } from 'lucide-react';
import { DatabaseUser } from '@/services/database';
import { deleteUser, updateUser } from '@/services/adminDatabase';
import UserDetailsModal from './UserDetailsModal';

interface UserManagementProps {
  users: DatabaseUser[];
  loading?: boolean;
  error?: string | null;
  onUsersChange: () => void;
  onRetry?: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ 
  users, 
  loading = false, 
  error = null, 
  onUsersChange, 
  onRetry 
}) => {
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<DatabaseUser>>({});
  const [selectedUser, setSelectedUser] = useState<DatabaseUser | null>(null);
  const [isOperating, setIsOperating] = useState(false);
  const { toast } = useToast();

  const handleEdit = useCallback((user: DatabaseUser) => {
    setEditingUser(user.id);
    setEditForm({
      name: user.name,
      start_weight: user.start_weight,
      current_weight: user.current_weight,
      target_weight: user.target_weight
    });
  }, []);

  const handleSave = useCallback(async (userId: string) => {
    if (isOperating) return;
    
    setIsOperating(true);
    try {
      await updateUser(userId, editForm);
      setEditingUser(null);
      setEditForm({});
      onUsersChange();
      toast({
        title: "User Updated",
        description: "User information has been updated successfully",
      });
    } catch (error) {
      console.error('Update user error:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update user",
        variant: "destructive"
      });
    } finally {
      setIsOperating(false);
    }
  }, [editForm, onUsersChange, toast, isOperating]);

  const handleDelete = useCallback(async (user: DatabaseUser) => {
    if (isOperating) return;
    
    if (!confirm(`Are you sure you want to delete ${user.name}? This will also delete all their weight entries and achievements.`)) {
      return;
    }

    setIsOperating(true);
    try {
      await deleteUser(user.id);
      onUsersChange();
      toast({
        title: "User Deleted",
        description: `${user.name} has been deleted successfully`,
      });
    } catch (error) {
      console.error('Delete user error:', error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive"
      });
    } finally {
      setIsOperating(false);
    }
  }, [onUsersChange, toast, isOperating]);

  const handleCancel = useCallback(() => {
    setEditingUser(null);
    setEditForm({});
  }, []);

  const handleFormChange = useCallback((field: string, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading users...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            Try Again
          </Button>
        )}
      </div>
    );
  }

  // No users state
  if (!users || users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg">No users found</p>
        <p className="text-gray-400">Users will appear here once they register for the challenge</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Start Weight</TableHead>
              <TableHead>Current Weight</TableHead>
              <TableHead>Target Weight</TableHead>
              <TableHead>Weight Lost</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {editingUser === user.id ? (
                    <Input
                      value={editForm.name || ''}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="w-32"
                      disabled={isOperating}
                    />
                  ) : (
                    user.name
                  )}
                </TableCell>
                <TableCell>{user.mobile}</TableCell>
                <TableCell>
                  {editingUser === user.id ? (
                    <Input
                      type="number"
                      step="0.1"
                      value={editForm.start_weight || ''}
                      onChange={(e) => handleFormChange('start_weight', parseFloat(e.target.value) || 0)}
                      className="w-20"
                      disabled={isOperating}
                    />
                  ) : (
                    `${user.start_weight} kg`
                  )}
                </TableCell>
                <TableCell>
                  {editingUser === user.id ? (
                    <Input
                      type="number"
                      step="0.1"
                      value={editForm.current_weight || ''}
                      onChange={(e) => handleFormChange('current_weight', parseFloat(e.target.value) || 0)}
                      className="w-20"
                      disabled={isOperating}
                    />
                  ) : (
                    `${user.current_weight} kg`
                  )}
                </TableCell>
                <TableCell>
                  {editingUser === user.id ? (
                    <Input
                      type="number"
                      step="0.1"
                      value={editForm.target_weight || ''}
                      onChange={(e) => handleFormChange('target_weight', parseFloat(e.target.value) || 0)}
                      className="w-20"
                      disabled={isOperating}
                    />
                  ) : (
                    `${user.target_weight} kg`
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {(user.start_weight - user.current_weight).toFixed(1)} kg
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-500">
                    {user.points || 0} pts
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {editingUser === user.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleSave(user.id)}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={isOperating}
                        >
                          <Save size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={isOperating}
                        >
                          <X size={14} />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedUser(user)}
                          disabled={isOperating}
                        >
                          <Eye size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(user)}
                          disabled={isOperating}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(user)}
                          disabled={isOperating}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUserUpdate={onUsersChange}
        />
      )}
    </>
  );
};

export default UserManagement;
