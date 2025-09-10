import React from 'react';

export const Card: React.FC<{ title: string; children: React.ReactNode; className?: string; }> = ({ title, children, className }) => (
  <div className={`bg-card dark:bg-dark-card rounded-xl shadow-md p-6 ${className}`}>
    <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-4">{title}</h2>
    {children}
  </div>
);
