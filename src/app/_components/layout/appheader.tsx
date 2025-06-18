import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ProjectSelector } from "./projectselector";
import { UserSection } from "./usersection";
import Image from "next/image";

interface AppHeaderProps {
  isSignedIn: boolean;
  showProjectSelector?: boolean;
}

export function AppHeader({ isSignedIn, showProjectSelector = true }: AppHeaderProps) {
  return (
    <div className="z-10 flex justify-between p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-foreground">
              <Image 
                src="/dragnchat.svg" 
                alt="DragnChat Logo" 
                width={32}
                height={32}
                className="w-8 h-8"
              />
            </BreadcrumbLink>
          </BreadcrumbItem>
          {showProjectSelector && <BreadcrumbSeparator className="text-foreground" />}
          <BreadcrumbItem >
          <div className="text-foreground text-lg font-semibold hover:cursor-default">
            {showProjectSelector && <ProjectSelector />}
          </div>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center gap-4">
        <UserSection isSignedIn={isSignedIn} />
      </div>
    </div>
  );
}
