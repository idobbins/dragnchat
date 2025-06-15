import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconBrandGoogleFilled } from "@tabler/icons-react";
import { Loader2Icon } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";

export function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = () => {
    setIsLoading(true);
  };

  return (
    <SignInButton>
      <Button
        variant="secondary"
        className="pointer-events-auto w-32 hover:cursor-pointer"
        disabled={isLoading}
        onClick={handleSignIn}
      >
        {isLoading ? (
          <>
            <Loader2Icon className="animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <IconBrandGoogleFilled />
            Sign In
          </>
        )}
      </Button>
    </SignInButton>
  );
}
