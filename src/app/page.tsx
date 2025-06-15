"use client";

import { useAuth } from "@clerk/nextjs";
import { AppHeader } from "./_components/layout/appheader";
import { Editor } from "./_components/editor/editor";

export default function Home() {
  const { isSignedIn } = useAuth();

  return (
    <main className="relative flex h-screen w-screen flex-col">
      <AppHeader isSignedIn={!!isSignedIn} />
      <Editor />
    </main>
  );
}
