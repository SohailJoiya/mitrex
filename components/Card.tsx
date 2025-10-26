import React from 'react';

// Fix: Extended CardProps to accept standard HTML attributes like onClick.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`
      bg-gradient-to-br from-brand-surface to-black/30 
      p-6 rounded-xl shadow-2xl shadow-black/40 
      border border-white/10 
      transition-all duration-300 
      hover:border-white/20 hover:shadow-brand-orange/10
      ${className}
    `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
