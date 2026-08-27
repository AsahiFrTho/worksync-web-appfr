import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-200 ease-premium outline-none select-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-soft hover:opacity-95 hover:shadow-card-hover hover:-translate-y-px',
        outline:
          'border-border bg-transparent text-foreground shadow-none hover:bg-muted hover:border-border/80',
        secondary:
          'bg-secondary text-secondary-foreground border border-border hover:bg-muted',
        ghost:
          'hover:bg-muted text-muted-foreground hover:text-foreground',
        destructive:
          'bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/15',
        link: 'text-primary underline-offset-4 hover:underline hover:opacity-90',
      },
      size: {
        default:
          'h-8.5 gap-1.5 px-3 py-1.5 text-xs sm:text-sm',
        xs: "h-6 gap-1 rounded-md px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7.5 gap-1.5 rounded-md px-2.5 text-xs font-medium [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-10 gap-2 px-4 py-2 text-sm font-medium',
        icon: 'size-8.5',
        'icon-xs':
          "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        'icon-sm':
          'size-7.5 rounded-md',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
