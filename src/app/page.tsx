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

        {/* Legal links footer */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-muted-foreground text-sm">
            Make sure you agree to our{" "}
            <a 
              href="/terms" 
              className="text-primary hover:text-primary/80 underline underline-offset-4"
            >
              Terms
            </a>
            {" "}and our{" "}
            <a 
              href="/privacy" 
              className="text-primary hover:text-primary/80 underline underline-offset-4"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </main>
    </HydrateClient>
  );
}
