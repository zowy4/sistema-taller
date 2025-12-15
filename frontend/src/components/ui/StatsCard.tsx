"use client";
import React from 'react';
type Props = {
  title: string;
  value: React.ReactNode;
  valueClassName?: string;
  className?: string;
};
export const StatsCard: React.FC<Props> = ({ title, value, valueClassName = '', className = '' }) => {
  return (
    <div className={`p-4 rounded border ${className}`}>
      <div className="text-sm text-gray-500">{title}</div>
      <div className={`text-2xl font-semibold ${valueClassName}`}>{value}</div>
    </div>
  );
};
export default StatsCard;
