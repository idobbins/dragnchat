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
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`
        flex flex-col items-end 
        transition-all duration-300 ease-in-out
        ${isHovered ? "bg-card shadow-lg rounded-md" : ""}
      `}>
        {/* Button/Header Section */}
        <div className={`
          ${isHovered ? "w-80 rounded-t-md bg-primary" : "w-32 rounded-md"}
          transition-all duration-300 ease-in-out
        `}>
          <Button
            className="w-full border-none shadow-none hover:bg-transparent hover:cursor-pointer"
            variant={isHovered ? "default" : "default"}
          >
            <span>Sign In</span>
          </Button>
        </div>

        {/* Providers Section */}
        <div className={`
          w-80 overflow-hidden transition-all duration-300 ease-in-out
          ${isHovered ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
        `}>
          <SignIn.Root>
            <Clerk.Loading>
              {(isGlobalLoading) => (
                <SignIn.Step name="start">
                  <Card className="border-0 shadow-none rounded-t-none">
                    {/* Removed header as requested */}
                    <CardContent className="grid gap-y-3 p-4">
                      <Clerk.Connection name="google" asChild>
                        <Button
                          variant="outline"
                          type="button"
                          className="w-full"
                          disabled={isGlobalLoading}
                        >
                          <Clerk.Loading scope="provider:google">
                            {(isLoading) =>
                              isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <IconBrandGoogleFilled className="mr-2 h-4 w-4" />
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
                          className="w-full"
                          disabled={isGlobalLoading}
                        >
                          <Clerk.Loading scope="provider:github">
                            {(isLoading) =>
                              isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <IconBrandGithubFilled className="mr-2 h-4 w-4" />
                                  Sign in with GitHub
                                </>
                              )
                            }
                          </Clerk.Loading>
                        </Button>
                      </Clerk.Connection>
                    </CardContent>
                  </Card>
                </SignIn.Step>
              )}
            </Clerk.Loading>
          </SignIn.Root>
        </div>
      </div>
    </div>
  );
}
