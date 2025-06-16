"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { Button } from "@/components/ui/button";
import {
  IconBrandGoogleFilled,
  IconBrandGithubFilled,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export function SignInDropdown() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isHovered ? (
        // Fake "Sign In" button
        <div className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium">
          Sign In
        </div>
      ) : (
        // Sign-in options
        <SignIn.Root>
          <Clerk.Loading>
            {(isGlobalLoading) => (
              <SignIn.Step name="start">
                <div className="border-border bg-background flex flex-col gap-2 rounded-md border p-2">
                  <Clerk.Connection name="google" asChild>
                    <Button
                      variant="outline"
                      type="button"
                      className="flex w-full items-center gap-2 hover:cursor-pointer"
                      disabled={isGlobalLoading}
                    >
                      <Clerk.Loading scope="provider:google">
                        {(isLoading) =>
                          isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <IconBrandGoogleFilled className="h-4 w-4" />
                              Sign in with Google
                            </>
                          )
                        }
                      </Clerk.Loading>
                    </Button>
                  </Clerk.Connection>

                  <Clerk.Connection name="github" asChild>
                    <Button
                      variant="outline"
                      type="button"
                      className="flex w-full items-center hover:cursor-pointer"
                      disabled={isGlobalLoading}
                    >
                      <Clerk.Loading scope="provider:github">
                        {(isLoading) =>
                          isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <IconBrandGithubFilled className="h-4 w-4" />
                              Sign in with GitHub
                            </>
                          )
                        }
                      </Clerk.Loading>
                    </Button>
                  </Clerk.Connection>
                </div>
              </SignIn.Step>
            )}
          </Clerk.Loading>
        </SignIn.Root>
      )}
    </div>
  );
}
