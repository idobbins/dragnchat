"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading editor..." }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center h-full w-full bg-gray-50/50">
      <Card className="w-64 shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative h-10 w-10">
              <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
              <div className="absolute inset-1 rounded-full border-2 border-gray-200"></div>
            </div>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
