import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
    {
        variants: {
            variant: {
                default: 'bg-primary/20 text-primary border border-primary/30',
                secondary: 'bg-secondary/20 text-secondary border border-secondary/30',
                success: 'bg-success/20 text-success border border-success/30',
                warning: 'bg-warning/20 text-warning border border-warning/30',
                danger: 'bg-danger/20 text-danger border border-danger/30',
                outline: 'text-foreground border border-border',
                gold: 'bg-gold/20 text-gold border border-gold/30',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
