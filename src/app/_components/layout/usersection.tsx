import { currentUser } from "@clerk/nextjs/server";
import {
  experimental_taintObjectReference,
  experimental_taintUniqueValue,
} from "react";
import { SignInDropdown } from "../auth/signin-dropdown";
import { UserProfileDialog } from "../auth/user-profile-dialog";

interface UserSectionProps {
  isSignedIn?: boolean;
}

export async function UserSection({ isSignedIn }: UserSectionProps) {
  const user = await currentUser();

  if (user) {
    // Taint the entire user object first - this is our primary defense
    experimental_taintObjectReference(
      "Clerk user object contains sensitive data. Use safeUserData instead.",
      user,
    );

    // Taint sensitive string values individually
    if (user.id) {
      experimental_taintUniqueValue(
        "User ID should not be exposed to client",
        user,
        user.id,
      );
    }

    // Taint complex objects by reference
    const sensitiveObjects = [
      user.emailAddresses,
      user.phoneNumbers,
      user.externalAccounts,
      user.privateMetadata,
      user.publicMetadata,
      user.unsafeMetadata,
    ];

    sensitiveObjects.forEach((obj) => {
      if (obj != null) {
        experimental_taintObjectReference(
          "Sensitive user data object should not be exposed to client",
          obj,
        );
      }
    });
  }

  // Create completely new safe object with only explicitly allowed fields
  const safeUserData = user
    ? {
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        imageUrl: user.imageUrl,
        primaryEmailAddress: user.primaryEmailAddress?.emailAddress ?? null,
      }
    : null;

  return (
    <div className="flex items-center gap-4">
      {isSignedIn && safeUserData ? (
        <UserProfileDialog userData={safeUserData} />
      ) : (
        <SignInDropdown />
      )}
    </div>
  );
}
