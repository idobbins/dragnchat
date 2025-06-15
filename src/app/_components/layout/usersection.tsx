"use client";

import {
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { SignInDropdown } from "../auth/signin-dropdown";
import { UserProfileDialog } from "../auth/user-profile-dialog";

interface UserSectionProps {
  isSignedIn: boolean;
}

export function UserSection({ isSignedIn }: UserSectionProps) {
  return (
    <div className="flex items-center gap-4">
      <SignedOut>
        <SignInDropdown />
      </SignedOut>
      <SignedIn>
        <UserProfileDialog />
      </SignedIn>
    </div>
  );
}
