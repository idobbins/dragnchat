"use client";

import { useAuth } from "@clerk/nextjs";
import { AppHeader } from "./_components/layout/appheader";

export default function Home() {
  const { isSignedIn } = useAuth();

  return (
    <main className="flex h-screen w-screen flex-col bg-none">
      <AppHeader isSignedIn={!!isSignedIn} />
    </main>
  );
}
