import { currentUser } from "@clerk/nextjs/server";
import {
  experimental_taintObjectReference,
  experimental_taintUniqueValue,
} from "react";
import { SignInDropdown } from "../auth/signin-dropdown";
import { UserProfileDialog } from "../auth/user-profile-dialog";
import { api } from "@/trpc/server";

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

  // Helper function to compute initials server-side
  const computeInitials = (userData: {
    firstName: string | null;
    lastName: string | null;
    fullName: string | null;
  }): string => {
    if (userData.firstName && userData.lastName) {
      return `${userData.firstName[0]}${userData.lastName[0]}`;
    }
    if (userData.fullName) {
      return userData.fullName
        .split(" ")
        .map((name: string) => name[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    return "?";
  };

  // Create completely new safe object with only explicitly allowed fields
  const safeUserData = user
    ? {
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        imageUrl: user.imageUrl,
        primaryEmailAddress: user.primaryEmailAddress?.emailAddress ?? null,
        initials: computeInitials(user), // Server-computed initials
      }
    : null;

  // Fetch API key status server-side for better SSR performance
  let initialApiKeyStatus: { hasApiKey: boolean } | undefined;
  if (isSignedIn && user) {
    try {
      initialApiKeyStatus = await api.user.getOpenRouterKeyStatus();
    } catch {
      // Fallback to undefined if server-side fetch fails
      initialApiKeyStatus = undefined;
    }
  }

  return (
    <div className="flex items-center gap-4">
      {isSignedIn && safeUserData ? (
        <UserProfileDialog 
          userData={safeUserData} 
          initialApiKeyStatus={initialApiKeyStatus}
        />
      ) : (
        <SignInDropdown />
      )}
    </div>
  );
}
