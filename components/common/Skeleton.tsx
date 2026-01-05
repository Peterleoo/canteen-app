import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'rect' | 'circle' | 'text';
    width?: string | number;
    height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'rect',
    width,
    height,
}) => {
    const baseClass = 'skeleton';
    const variantClass = variant === 'circle' ? 'rounded-full' : 'rounded-md';

    return (
        <div
            className={`${baseClass} ${variantClass} ${className}`}
            style={{
                width: width,
                height: height,
            }}
        />
    );
};
