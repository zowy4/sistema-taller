"use client";
import React from 'react';
export const Loader: React.FC<{ text?: string; className?: string }> = ({ text = 'Cargando...', className = '' }) => {
  return (
    <div className={`w-full text-center py-8 ${className}`}>
      <span className="animate-pulse text-gray-700">{text}</span>
    </div>
  );
};
export default Loader;
