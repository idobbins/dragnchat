"use client";

import {
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { LoginButton } from "../auth/loginbutton";

interface UserSectionProps {
  isSignedIn: boolean;
}

export function UserSection({ isSignedIn }: UserSectionProps) {
  return (
    <div className="flex items-center gap-4">
      <SignedOut>
        <LoginButton />
      </SignedOut>
      <SignedIn>
        <div className="pointer-events-auto">
          <UserButton />
        </div>
      </SignedIn>
    </div>
  );
}
