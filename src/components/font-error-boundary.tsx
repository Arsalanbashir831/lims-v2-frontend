"use client";

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class FontErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Only log font-related errors
    if (error.message.includes('font') || error.message.includes('Geist')) {
      console.warn('Font loading error caught:', error.message);
      // Don't re-throw font errors, just use fallbacks
      return;
    }
    // Re-throw non-font errors
    throw error;
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="font-sans">
          {this.props.children}
        </div>
      );
    }

    return this.props.children;
  }
}
