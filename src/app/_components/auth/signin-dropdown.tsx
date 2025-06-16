"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconBrandGoogleFilled, IconBrandGithubFilled } from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export function SignInDropdown() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="rounded-md overflow-hidden transition-all duration-200 ease-in-out hover:shadow-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isHovered ? (
        // Simple "Sign In" button
        <div className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
          Sign In
        </div>
      ) : (
        // Sign-in options
        <div className="p-2 border border-border rounded-md bg-background">
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full flex gap-2">
              <IconBrandGoogleFilled />
              Sign in with Google
            </Button>
            <Button variant="outline" className="w-full flex gap-2">
              <IconBrandGithubFilled />
              Sign in with GitHub
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
