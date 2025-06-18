import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function SSOCallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="text-center space-y-6">
          {/* Logo/Branding */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary-foreground"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Loading Spinner */}
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>

          {/* Status Messages */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">
              Completing Sign In
            </h1>
            <p className="text-muted-foreground">
              Please wait while we finish setting up your account...
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full animate-pulse w-3/4"></div>
          </div>

          {/* Additional Info */}
          <div className="text-sm text-muted-foreground">
            <p>This should only take a few seconds.</p>
            <p className="mt-2">
              If this page doesn&apos;t redirect automatically, please{" "}
              <Link href="/" className="text-primary hover:underline">
                click here
              </Link>{" "}
              to continue.
            </p>
          </div>
        </div>

        {/* Hidden Clerk Component */}
        <div className="sr-only">
          <AuthenticateWithRedirectCallback />
        </div>
      </div>
    </div>
  );
}
