"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { SignInDropdown } from "../auth/signin-dropdown";
import { UserProfileDialog } from "../auth/user-profile-dialog";

export function UserSection() {
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
