import React from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
}

export function Notification({ message, type }: NotificationProps) {
  return (
    <div
      className={`
        px-4 py-2 rounded-lg shadow-lg text-white font-medium
        transform transition-all duration-300 animate-fade-in
        ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}
      `}
    >
      {message}
    </div>
  );
} 