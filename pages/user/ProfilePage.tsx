import React, { useState } from 'react';
import { User } from '../../types';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import api from '../../services/api';

interface ProfilePageProps {
  user: User;
  onUpdate: (updatedData: Pick<User, 'firstName' | 'lastName' | 'email' | 'phone'>) => Promise<void>;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isPasswordSuccess, setIsPasswordSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(false);
    setError('');
    setIsLoading(true);
    try {
        await onUpdate(formData);
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: any) {
        setError(err.message || "Failed to update profile.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleChangePassword = async (data: { oldPass: string; newPass: string }) => {
    await api.put('/api/users/me/password', {
        currentPassword: data.oldPass,
        newPassword: data.newPass,
    });
    setIsChangePasswordModalOpen(false);
    setIsPasswordSuccess(true);
    setTimeout(() => setIsPasswordSuccess(false), 3000);
  };

  return (
    <>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Edit Profile</h1>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <Input
                  label="First Name"
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="flex-1">
                <Input
                  label="Last Name"
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <Input
              label="Email Address"
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <Input
              label="Phone Number"
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex items-center justify-end gap-4 pt-4">
              {isSuccess && <p className="text-green-400 text-sm">Profile updated successfully!</p>}
              {isPasswordSuccess && <p className="text-green-400 text-sm">Password updated successfully!</p>}
              <Button type="button" variant="secondary" onClick={() => setIsChangePasswordModalOpen(true)}>Change Password</Button>
              <Button type="submit" variant="success" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </form>
        </Card>
      </div>
      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen} 
        onClose={() => setIsChangePasswordModalOpen(false)} 
        onSubmit={handleChangePassword}
      />
    </>
  );
};

export default ProfilePage;