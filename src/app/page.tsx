import { auth } from "@clerk/nextjs/server";
import { HydrateClient, api } from "@/trpc/server";
import { AppHeader } from "./_components/layout/appheader";
import { Editor } from "./_components/editor/editor";

export default async function Home() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  // Prefetch data on the server for better performance
  const health = await api.health();

  return (
    <HydrateClient>
      <main className="relative flex h-screen w-screen flex-col">
        <AppHeader isSignedIn={isSignedIn} />
        <Editor />
        {/* Server-rendered health status - demonstrates SSR data fetching */}
        <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
          Server Status: {health.message}
        </div>
      </main>
    </HydrateClient>
  );
}
