"use client";

import { useSignIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  IconBrandGoogleFilled,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

export function SignInDropdown() {
  const { signIn } = useSignIn();
  const [isLoading, setIsLoading] = useState(false);

  const signInWithGoogle = async () => {
    if (!signIn) return;
    
    setIsLoading(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (error) {
      console.error("Error signing in:", error);
      setIsLoading(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Sign In</Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="end"
        alignOffset={0}
        side="bottom"
        sideOffset={8}
      >
        <div className="flex flex-col gap-2 p-2">
          <Button
            variant="outline"
            type="button"
            className="flex w-full items-center gap-2 hover:cursor-pointer"
            disabled={isLoading}
            onClick={signInWithGoogle}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <IconBrandGoogleFilled className="h-4 w-4" />
                Sign in with Google
              </>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
