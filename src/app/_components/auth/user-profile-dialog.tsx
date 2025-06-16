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
import { CheckCircle2, Loader2, LogOut, XCircle, AlertCircle, Minus, Save, Trash2 } from "lucide-react";
import { api } from "@/trpc/react";

// Type definitions for better state management
type ApiKeyStatus = 'NOT_SET' | 'VALIDATING' | 'VALID' | 'INVALID';
type ButtonAction = 'SAVE' | 'DELETE' | 'LOADING';

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

interface ApiKeyState {
  status: ApiKeyStatus;
  hasExistingKey: boolean;
  isUserTyping: boolean;
  validationError: string | null;
}

export function UserProfileDialog({ userData }: UserProfileDialogProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isPendingSuccess, setIsPendingSuccess] = useState<boolean>(false);
  const { signOut } = useClerk();

  // tRPC hooks - only fetch when dialog is open
  const { data: keyStatus, refetch: refetchKeyStatus } = api.user.getOpenRouterKeyStatus.useQuery(
    undefined,
    { enabled: isOpen }
  );
  const setApiKeyMutation = api.user.setOpenRouterKey.useMutation({
    onSuccess: async () => {
      setValidationError("");
      setApiKey(""); // Clear input after successful save
      setIsPendingSuccess(true); // Prevent flickering to "Not Set"
      await refetchKeyStatus();
      setIsPendingSuccess(false); // Clear pending state after refetch
    },
    onError: (error) => {
      setValidationError(error.message);
      setIsPendingSuccess(false); // Clear pending state on error
    },
    onSettled: () => {
      setIsValidating(false);
    },
  });
  
  const deleteApiKeyMutation = api.user.deleteOpenRouterKey.useMutation({
    onSuccess: async () => {
      setValidationError("");
      setApiKey("");
      await refetchKeyStatus();
    },
    onError: (error) => {
      setValidationError(error instanceof Error ? error.message : "Failed to delete API key");
    },
  });

  /**
   * Handle saving/updating the API key
   */
  const handleSaveApiKey = async (): Promise<void> => {
    if (!apiKey || apiKey.length < 10) {
      setValidationError("API key must be at least 10 characters");
      return;
    }

    setIsValidating(true);
    setValidationError("");
    
    try {
      await setApiKeyMutation.mutateAsync({ apiKey });
    } catch (error) {
      // Error handling is done in the mutation's onError callback
    }
  };

  /**
   * Handle deleting the existing API key
   */
  const handleDeleteApiKey = async (): Promise<void> => {
    try {
      await deleteApiKeyMutation.mutateAsync();
    } catch (error) {
      // Error handling is done in the mutation's onError callback
    }
  };

  /**
   * Handle sign out action
   */
  const handleSignOut = async (): Promise<void> => {
    setIsLoading(true);
    await signOut();
    setIsLoading(false);
    setIsOpen(false);
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

  /**
   * Derive API key status for cleaner state management
   */
  const getApiKeyStatus = (): ApiKeyStatus => {
    if (isValidating) return 'VALIDATING';
    if (validationError) return 'INVALID';
    // Show VALID during pending success to prevent flickering
    if (isPendingSuccess) return 'VALID';
    if (keyStatus?.hasApiKey && !validationError) return 'VALID';
    return 'NOT_SET';
  };

  /**
   * Get the current API key state
   */
  const getApiKeyState = (): ApiKeyState => {
    const status = getApiKeyStatus();
    return {
      status,
      hasExistingKey: Boolean(keyStatus?.hasApiKey),
      isUserTyping: apiKey.length > 0,
      validationError: validationError || null,
    };
  };

  /**
   * Determine what action the button should perform
   */
  const getButtonAction = (state: ApiKeyState): ButtonAction => {
    if (isValidating || setApiKeyMutation.isPending || deleteApiKeyMutation.isPending) {
      return 'LOADING';
    }
    
    if (state.hasExistingKey && !state.isUserTyping) {
      return 'DELETE';
    }
    
    return 'SAVE';
  };

  /**
   * Get the appropriate placeholder text
   */
  const getPlaceholderText = (state: ApiKeyState): string => {
    if (state.hasExistingKey) {
      return "Update API key";
    }
    return "Enter your OpenRouter API key";
  };

  /**
   * Handle input change with validation error clearing
   */
  const handleApiKeyChange = (value: string): void => {
    setApiKey(value);
    if (validationError && value !== apiKey) {
      setValidationError("");
    }
  };

  /**
   * Handle button click based on current action
   */
  const handleButtonClick = async (): Promise<void> => {
    const action = getButtonAction(apiKeyState);
    
    switch (action) {
      case 'SAVE':
        await handleSaveApiKey();
        break;
      case 'DELETE':
        await handleDeleteApiKey();
        break;
      case 'LOADING':
        // Do nothing while loading
        break;
    }
  };

  const apiKeyState = getApiKeyState();
  const buttonAction = getButtonAction(apiKeyState);
  const placeholderText = getPlaceholderText(apiKeyState);
  const hasValidApiKey = apiKeyState.status === 'VALID';

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
              {(() => {
                switch (apiKeyState.status) {
                  case 'VALIDATING':
                    return (
                      <Badge variant="secondary">
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Validating...
                      </Badge>
                    );
                  case 'VALID':
                    return (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Connected
                      </Badge>
                    );
                  case 'INVALID':
                    return (
                      <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Invalid
                      </Badge>
                    );
                  case 'NOT_SET':
                  default:
                    return (
                      <Badge variant="outline">
                        <Minus className="mr-1 h-3 w-3" />
                        Not Set
                      </Badge>
                    );
                }
              })()}
            </div>
            
            {/* Single row: Input field + Icon button */}
            <div className="flex gap-2">
              <Input
                id="openrouter-api-key"
                type="password"
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder={placeholderText}
                className="font-mono flex-1"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleButtonClick}
                disabled={buttonAction === 'LOADING'}
                className={buttonAction === 'DELETE' ? "text-destructive hover:text-destructive" : ""}
                title={
                  buttonAction === 'SAVE' 
                    ? "Save API key" 
                    : buttonAction === 'DELETE' 
                    ? "Delete API key" 
                    : "Loading..."
                }
              >
                {buttonAction === 'LOADING' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : buttonAction === 'DELETE' ? (
                  <Trash2 className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Error message */}
            {apiKeyState.validationError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {apiKeyState.validationError}
              </div>
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
