import { currentUser } from "@clerk/nextjs/server";
import { SignInDropdown } from "../auth/signin-dropdown";
import { UserProfileDialog } from "../auth/user-profile-dialog";

interface UserSectionProps {
  isSignedIn?: boolean;
}

export async function UserSection({ isSignedIn }: UserSectionProps) {
  // Fetch user data server-side for better SSR performance
  const user = await currentUser();

  // Extract only serializable data needed for the client component
  const userData = user ? {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    imageUrl: user.imageUrl,
    primaryEmailAddress: user.primaryEmailAddress?.emailAddress ?? null,
  } : null;

  return (
    <div className="flex items-center gap-4">
      {isSignedIn && userData ? (
        <UserProfileDialog userData={userData} />
      ) : (
        <SignInDropdown />
      )}
    </div>
  );
}
