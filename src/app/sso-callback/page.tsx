import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SSOCallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="text-center space-y-6">
          {/* Logo/Branding */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center p-2">
              <Image
                src="/dragnchat.svg"
                alt="DragNChat Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
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
