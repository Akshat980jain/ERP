import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  hover?: boolean;
}

export function Card({ children, className, padding = 'md', variant = 'default', hover = false }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-xl border transition-all duration-300',
        {
          // Default variant
          'bg-white border-gray-200/60 shadow-sm': variant === 'default',
          // Elevated variant
          'bg-white border-gray-200/60 shadow-lg shadow-gray-200/50': variant === 'elevated',
          // Outlined variant
          'bg-white/50 border-gray-300/60 shadow-none backdrop-blur-sm': variant === 'outlined',
          // Gradient variant
          'bg-gradient-to-br from-white to-gray-50/50 border-gray-200/40 shadow-lg shadow-gray-200/30': variant === 'gradient',
          // Hover effects
          'hover:shadow-lg hover:shadow-gray-200/30 hover:-translate-y-1': hover && variant === 'default',
          'hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1': hover && variant === 'elevated',
          'hover:shadow-md hover:shadow-gray-200/20 hover:-translate-y-1': hover && variant === 'outlined',
          'hover:shadow-xl hover:shadow-gray-200/40 hover:-translate-y-1': hover && variant === 'gradient',
        },
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('px-6 py-4 border-b border-gray-100/60', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={clsx('text-lg font-semibold text-gray-900 tracking-tight', className)}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('px-6 py-4', className)}>
      {children}
    </div>
  );
}

// New premium stat card component
export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  className 
}: { 
  title: string; 
  value: string; 
  icon: React.ComponentType<{ className?: string }>; 
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}) {
  return (
    <Card className={clsx('overflow-hidden', className)} hover>
      <div className="relative p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
            {trend && trendValue && (
              <div className={clsx(
                'flex items-center text-sm font-medium',
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 'text-gray-600'
              )}>
                {trend === 'up' && <span className="mr-1">↗</span>}
                {trend === 'down' && <span className="mr-1">↘</span>}
                {trend === 'neutral' && <span className="mr-1">→</span>}
                {trendValue}
              </div>
            )}
          </div>
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      </div>
    </Card>
  );
}