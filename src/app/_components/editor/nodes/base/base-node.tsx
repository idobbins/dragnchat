import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BaseNodeProps } from "./types";

export function BaseNode({ data, children, selected }: BaseNodeProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'input':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'model':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'output':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'operator':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card 
      className={`min-w-[200px] transition-all duration-200 ${
        selected 
          ? 'ring-2 ring-blue-500 shadow-lg' 
          : 'shadow-md hover:shadow-lg'
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium truncate">{data.label}</h3>
          <Badge 
            variant="outline" 
            className={`text-xs ${getCategoryColor(data.category)}`}
          >
            {data.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
}
