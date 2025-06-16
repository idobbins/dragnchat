"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Loader2, LogOut, XCircle } from "lucide-react";

interface UserData {
  id: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  imageUrl: string;
  primaryEmailAddress: string | null;
}

interface UserProfileDialogProps {
  userData: UserData;
}

export function UserProfileDialog({ userData }: UserProfileDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut();
    setIsLoading(false);
    setIsOpen(false);
  };

  // Calculate initials from server-provided user data
  const initials =
    userData.firstName && userData.lastName
      ? `${userData.firstName[0]}${userData.lastName[0]}`
      : (userData.primaryEmailAddress?.[0] ?? "?");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative">
          <Avatar className="h-8 w-8 hover:cursor-pointer">
            <AvatarImage src={userData.imageUrl} alt={userData.fullName ?? ""} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div
            className={`border-background absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 ${
              apiKey ? "bg-green-500" : "bg-red-500"
            }`}
            title={apiKey ? "API Key Set" : "API Key Missing"}
          />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Account</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center py-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={userData.imageUrl} alt={userData.fullName ?? ""} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <h3 className="mt-4 text-lg font-medium">{userData.fullName}</h3>
          <p className="text-muted-foreground text-sm">
            {userData.primaryEmailAddress}
          </p>
        </div>
        <Separator />
        <div className="flex flex-col gap-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="openrouter-api-key">OpenRouter API Key</Label>
              {apiKey && (
                <Badge
                  variant={apiKey.length >= 20 ? "default" : "destructive"}
                  className={apiKey.length >= 20 ? "bg-green-600" : ""}
                >
                  {apiKey.length >= 20 ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      Connected
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" />
                      Invalid API Key
                    </>
                  )}
                </Badge>
              )}
            </div>
            <Input
              id="openrouter-api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your OpenRouter API key"
              className="font-mono"
            />
          </div>
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive mt-2 justify-start"
            onClick={handleSignOut}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Sign out
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
