import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default:
                    'bg-gradient-to-r from-primary to-primary-600 text-primary-foreground hover:shadow-glow-primary',
                destructive:
                    'bg-gradient-to-r from-danger to-red-700 text-white hover:shadow-glow-danger',
                outline:
                    'border border-border bg-transparent hover:bg-background-soft hover:border-primary',
                secondary:
                    'bg-background-soft text-foreground border border-border hover:bg-background-muted',
                ghost:
                    'hover:bg-background-soft hover:text-foreground',
                link:
                    'text-primary underline-offset-4 hover:underline',
                success:
                    'bg-gradient-to-r from-success to-green-700 text-white hover:shadow-glow-success',
                warning:
                    'bg-gradient-to-r from-warning to-amber-600 text-black hover:shadow-glow-warning',
                danger:
                    'bg-gradient-to-r from-danger to-red-700 text-white hover:shadow-glow-danger',
            },
            size: {
                default: 'h-10 px-4 py-2',
                sm: 'h-8 rounded-md px-3 text-xs',
                lg: 'h-12 rounded-lg px-8 text-base',
                xl: 'h-14 rounded-xl px-10 text-lg',
                icon: 'h-10 w-10',
                iconSm: 'h-8 w-8',
                iconLg: 'h-12 w-12',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, isLoading, children, disabled, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <>
                        <span className="loader mr-2" />
                        Loading...
                    </>
                ) : (
                    children
                )}
            </Comp>
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
