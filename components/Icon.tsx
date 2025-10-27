import React from 'react';

interface IconProps {
    path: string;
    className?: string;
    strokeWidth?: number;
}

const Icon: React.FC<IconProps> = ({ path, className = 'h-6 w-6', strokeWidth = 2 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={strokeWidth}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

export default Icon;
