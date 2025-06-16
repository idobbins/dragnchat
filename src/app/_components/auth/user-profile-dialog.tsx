"use client";

import { useState, useEffect } from "react";
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
import { CheckCircle2, Loader2, LogOut, XCircle, AlertCircle } from "lucide-react";
import { api } from "@/trpc/react";

interface UserData {
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
  const [validationError, setValidationError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const { signOut } = useClerk();

  // tRPC hooks
  const { data: keyStatus, refetch: refetchKeyStatus } = api.user.getOpenRouterKeyStatus.useQuery();
  const setApiKeyMutation = api.user.setOpenRouterKey.useMutation();
  const deleteApiKeyMutation = api.user.deleteOpenRouterKey.useMutation();

  // Load API key status when dialog opens
  useEffect(() => {
    if (isOpen) {
      refetchKeyStatus();
    }
  }, [isOpen, refetchKeyStatus]);

  // Debounced API key validation and saving
  useEffect(() => {
    if (!apiKey || apiKey.length < 10) {
      setValidationError("");
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsValidating(true);
      setValidationError("");

      try {
        // Save and validate the API key
        await setApiKeyMutation.mutateAsync({ apiKey });
        // Only refetch status after successful save to prevent loops
        await refetchKeyStatus();
      } catch (error) {
        setValidationError(error instanceof Error ? error.message : "Invalid API key");
      } finally {
        setIsValidating(false);
      }
    }, 1000); // Increased debounce time to reduce API calls

    return () => clearTimeout(timeoutId);
  }, [apiKey, setApiKeyMutation, refetchKeyStatus]);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut();
    setIsLoading(false);
    setIsOpen(false);
  };

  const handleDeleteApiKey = async () => {
    try {
      await deleteApiKeyMutation.mutateAsync();
      setApiKey("");
      setValidationError("");
      await refetchKeyStatus();
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : "Failed to delete API key");
    }
  };

  // Calculate initials from server-provided user data
  const initials =
    userData.firstName && userData.lastName
      ? `${userData.firstName[0]}${userData.lastName[0]}`
      : userData.fullName
        ? userData.fullName
            .split(" ")
            .map((name) => name[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
        : "?";

  const hasValidApiKey = keyStatus?.hasApiKey && !validationError;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative">
          <Avatar className="h-8 w-8 hover:cursor-pointer">
            <AvatarImage
              src={userData.imageUrl}
              alt={userData.fullName ?? ""}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div
            className={`border-background absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 ${
              hasValidApiKey ? "bg-green-500" : "bg-red-500"
            }`}
            title={hasValidApiKey ? "API Key Set" : "API Key Missing"}
          />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Account</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center py-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={userData.imageUrl}
              alt={userData.fullName ?? ""}
            />
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
              {isValidating ? (
                <Badge variant="secondary">
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Validating...
                </Badge>
              ) : hasValidApiKey ? (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Connected
                </Badge>
              ) : validationError ? (
                <Badge variant="destructive">
                  <XCircle className="mr-1 h-3 w-3" />
                  Invalid
                </Badge>
              ) : null}
            </div>
            <Input
              id="openrouter-api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={keyStatus?.hasApiKey ? "API key is set (enter new key to update)" : "Enter your OpenRouter API key"}
              className="font-mono"
            />
            {validationError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {validationError}
              </div>
            )}
            {keyStatus?.hasApiKey && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteApiKey}
                disabled={deleteApiKeyMutation.isPending}
                className="text-destructive hover:text-destructive"
              >
                {deleteApiKeyMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                Remove API Key
              </Button>
            )}
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
