"use client";

import React from 'react';

type Props = {
  message: string | null | undefined;
  className?: string;
  onClose?: () => void;
};

export const ErrorAlert: React.FC<Props> = ({ message, className = '', onClose }) => {
  if (!message) return null;
  return (
    <div className={`bg-red-100 text-red-800 p-3 rounded mb-4 flex items-start justify-between gap-3 ${className}`}>
      <div>
        <strong className="font-semibold">Error:</strong> <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-red-700 hover:text-red-900 font-medium"
          aria-label="Cerrar error"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;
