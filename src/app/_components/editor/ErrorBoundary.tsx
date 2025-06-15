"use client";

import React, { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });
    
    // You can also log the error to an error reporting service
    console.error("Editor error:", error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        this.props.fallback ?? (
          <Card className="w-full max-w-md mx-auto mt-8 shadow-lg">
            <CardHeader>
              <CardTitle className="text-red-500">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="font-semibold">Error:</p>
                <p className="text-sm text-gray-700 overflow-auto max-h-32 p-2 bg-gray-100 rounded">
                  {this.state.error?.message ?? "Unknown error"}
                </p>
              </div>
              
              {this.state.errorInfo && (
                <div className="mb-4">
                  <p className="font-semibold">Component Stack:</p>
                  <pre className="text-xs text-gray-700 overflow-auto max-h-32 p-2 bg-gray-100 rounded">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
              
              <Button 
                onClick={this.handleReset}
                className="w-full mt-2"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )
      );
    }

    return this.props.children;
  }
}
