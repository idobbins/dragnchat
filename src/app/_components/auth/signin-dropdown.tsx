"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { Button } from "@/components/ui/button";
import {
  IconBrandGoogleFilled,
  IconBrandGithubFilled,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function SignInDropdown() {
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
        <SignIn.Root>
          <Clerk.Loading>
            {(isGlobalLoading) => (
              <SignIn.Step name="start">
                <div className="flex flex-col gap-2 p-2">
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
      </PopoverContent>
    </Popover>
  );
}
