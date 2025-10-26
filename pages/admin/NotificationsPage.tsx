import React, { useState } from 'react';
import { Notification } from '../../types';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';

interface NotificationsPageProps {
  notifications: Notification[];
  onAdd: (data: { title: string; content: string; userId?: string }) => void;
  onUpdate: (notification: Notification) => void;
  onDelete: (id: string) => void;
}

const NotificationForm: React.FC<{
  notification?: Notification | null;
  onSave: (data: { title: string; content: string }) => void;
  onCancel: () => void;
}> = ({ notification, onSave, onCancel }) => {
  const [title, setTitle] = useState(notification?.title || '');
  const [content, setContent] = useState(notification?.content || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && content) {
      onSave({ title, content });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <h2 className="text-2xl font-bold text-white mb-6">
          {notification ? 'Edit Notification' : 'Create Notification'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Title"
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g., System Maintenance"
          />
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={5}
              placeholder="Enter notification details here..."
              className="w-full bg-gray-800 border border-gray-600 rounded-md p-2.5 text-white focus:ring-brand-orange focus:border-brand-orange transition"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="success">
              Save Notification
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const NotificationsPage: React.FC<NotificationsPageProps> = ({ notifications, onAdd, onUpdate, onDelete }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);

  const handleCreate = () => {
    setEditingNotification(null);
    setIsFormVisible(true);
  };

  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification);
    setIsFormVisible(true);
  };
  
  const handleSave = (data: { title: string; content: string }) => {
    if (editingNotification) {
      onUpdate({ ...editingNotification, ...data });
    } else {
      // The API expects 'message', but we use 'content' in the form.
      // The parent `App.tsx` component will handle the mapping.
      onAdd(data);
    }
    setIsFormVisible(false);
    setEditingNotification(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Manage Notifications</h1>
        <Button onClick={handleCreate}>Create Notification</Button>
      </div>
      
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-4 text-sm font-semibold text-gray-400">Date</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Title</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Content</th>
                <th className="p-4 text-sm font-semibold text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifications.length > 0 ? notifications.map((notif) => (
                <tr key={notif.id} className="border-b border-gray-800 hover:bg-gray-800">
                  <td className="p-4 text-sm text-gray-300 whitespace-nowrap">{notif.date}</td>
                  <td className="p-4 font-medium">{notif.title}</td>
                  <td className="p-4 text-sm text-gray-400 max-w-sm truncate">{notif.content}</td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <Button onClick={() => handleEdit(notif)} className="!px-3 !py-1 text-sm">Edit</Button>
                      <Button onClick={() => onDelete(notif.id)} variant="secondary" className="!px-3 !py-1 text-sm bg-red-800 hover:bg-red-700">Delete</Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan={4} className="text-center p-8 text-gray-500">
                        No notifications found.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {isFormVisible && (
        <NotificationForm
          notification={editingNotification}
          onSave={handleSave}
          onCancel={() => setIsFormVisible(false)}
        />
      )}
    </div>
  );
};

export default NotificationsPage;