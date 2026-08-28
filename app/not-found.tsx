import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-border bg-muted text-foreground">
          404
        </div>
        <h2 className="mt-4 text-xl font-semibold tracking-tight text-foreground">Page not found</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The page you are looking for does not exist or has been moved. Check the URL or return to the dashboard.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <Link href="/dashboard" className={cn(buttonVariants({ variant: 'default' }))}>
            Go to dashboard
          </Link>
          <Link href="/" className={cn(buttonVariants({ variant: 'outline' }))}>
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
