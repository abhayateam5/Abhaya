import * as React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: 'sm' | 'md' | 'lg';
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
    ({ className, size = 'md', ...props }, ref) => {
        const sizes = {
            sm: 'w-4 h-4 border-2',
            md: 'w-6 h-6 border-2',
            lg: 'w-10 h-10 border-3',
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'animate-spin rounded-full border-primary border-t-transparent',
                    sizes[size],
                    className
                )}
                {...props}
            />
        );
    }
);
Spinner.displayName = 'Spinner';

interface LoadingOverlayProps {
    isLoading: boolean;
    message?: string;
}

function LoadingOverlay({ isLoading, message = 'Loading...' }: LoadingOverlayProps) {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
                <Spinner size="lg" />
                <p className="text-muted-foreground">{message}</p>
            </div>
        </div>
    );
}

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> { }

function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-lg bg-background-muted',
                className
            )}
            {...props}
        />
    );
}

export { Spinner, LoadingOverlay, Skeleton };
