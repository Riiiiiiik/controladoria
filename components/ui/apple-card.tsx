import React from 'react';

interface AppleCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function AppleCard({ className = '', children, ...props }: AppleCardProps) {
    return (
        <div
            className={`rounded-2xl border border-apple-border/60 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
