'use client';

import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { Monitor, Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const themes = [
  {
    key: 'system',
    icon: Monitor,
    label: 'System theme',
  },
  {
    key: 'light',
    icon: Sun,
    label: 'Light theme',
  },
  {
    key: 'dark',
    icon: Moon,
    label: 'Dark theme',
  },
];

export type ThemeSwitcherProps = {
  value?: 'light' | 'dark' | 'system';
  onChange?: (theme: 'light' | 'dark' | 'system') => void;
  defaultValue?: 'light' | 'dark' | 'system';
  className?: string;
};

export const ThemeSwitcher = ({
  value,
  onChange,
  defaultValue = 'system',
  className,
}: ThemeSwitcherProps) => {
  const [theme, setTheme] = useControllableState({
    defaultProp: defaultValue,
    prop: value,
    onChange,
  });
  const [mounted, setMounted] = useState(false);

  const handleThemeClick = useCallback(
    (themeKey: 'light' | 'dark' | 'system') => {
      setTheme(themeKey);
    },
    [setTheme]
  );

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Always render something, never return null
  if (!mounted) {
    return (
      <div className={cn(
        'relative isolate flex items-center justify-between gap-2 h-8 rounded-full bg-background p-1 px-3 ring-1 ring-border',
        className
      )}>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-muted animate-pulse" />
          <div className="h-6 w-6 rounded-full bg-muted animate-pulse" />
          <div className="h-6 w-6 rounded-full bg-muted animate-pulse" />
        </div>
        <div className="h-4 w-12 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative isolate flex items-center justify-between gap-2 h-8 rounded-full bg-background p-1 px-3 ring-1 ring-border',
        className
      )}
    >
      <div className="flex items-center gap-2">
      {themes.map(({ key, icon: Icon, label }) => {
        const isActive = theme === key;

        return (
          <button
            aria-label={label}
            className="relative h-6 w-6 rounded-full"
            key={key}
            onClick={() => handleThemeClick(key as 'light' | 'dark' | 'system')}
            type="button"
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full bg-secondary"
                layoutId="activeTheme"
                transition={{ type: 'spring', duration: 0.5 }}
              />
            )}
            <Icon
              className={cn(
                'relative z-10 m-auto h-4 w-4',
                isActive ? 'text-foreground' : 'text-muted-foreground'
              )}
            />
          </button>
        );
      })}
      </div>
        <p className="text-xs text-muted-foreground font-semibold capitalize">
          {theme}
        </p>
    </div>
  );
};
