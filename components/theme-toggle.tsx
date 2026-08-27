'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        'hover:bg-muted/80'
      )}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <Sun
        className={cn(
          'absolute size-4 transition-all duration-300 ease-in-out',
          theme === 'dark' 
            ? 'rotate-90 opacity-0 scale-75' 
            : 'rotate-0 opacity-100 scale-100'
        )}
      />
      <Moon
        className={cn(
          'absolute size-4 transition-all duration-300 ease-in-out',
          theme === 'dark'
            ? 'rotate-0 opacity-100 scale-100'
            : '-rotate-90 opacity-0 scale-75'
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
