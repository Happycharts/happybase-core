"use client";

import Link from "next/link";
import { Ellipsis } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/app/utils/utils";
import { getMenuList } from "@/app/utils/menu-list";
import { Button } from "@/components/ui/button";
import { CollapseMenuButton } from "@/components/sidebar/collapse-menu-button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from "@/components/ui/tooltip";
import { UserButton, useUser, OrganizationSwitcher } from "@clerk/nextjs";

interface MenuProps {
  isOpen: boolean | undefined;
}

export function Menu({ isOpen }: MenuProps) {
  const pathname = usePathname();
  const menuList = getMenuList(pathname);
  const { user } = useUser();

  return (
    <nav className="flex flex-col h-full w-full">
      <div className={cn(
        "mt-8 mb-6 px-2",
        isOpen === false ? "flex justify-center" : ""
      )}>
        <OrganizationSwitcher 
          hidePersonal
          appearance={{
            elements: {
              rootBox: {
                width: isOpen === false ? "40px" : "100%",
                justifyContent: isOpen === false ? "center" : "flex-start",
              },
              organizationSwitcherTrigger: {
                padding: isOpen === false ? "8px" : "8px 12px",
                width: "100%",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
                "&:hover": {
                  backgroundColor: "#f1f5f9",
                },
              },
              organizationPreview: {
                fontSize: "14px",
                fontWeight: "500",
              },
            }
          }}
        />
      </div>
      <ul className="flex flex-col items-start space-y-1 px-2 flex-grow">
        {menuList.map(({ groupLabel, menus }, index) => (
          <li className={cn("w-full", groupLabel ? "pt-5" : "")} key={index}>
            {(isOpen && groupLabel) || isOpen === undefined ? (
              <p className="text-sm font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate">
                {groupLabel}
              </p>
            ) : !isOpen && isOpen !== undefined && groupLabel ? (
              <TooltipProvider>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger className="w-full">
                    <div className="w-full flex justify-center items-center">
                      <Ellipsis className="h-5 w-5" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{groupLabel}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <p className="pb-2"></p>
            )}
            {menus.map(
              ({ href, label, icon: Icon, active, submenus }, index) =>
                submenus.length === 0 ? (
                  <div className="w-full" key={index}>
                    <TooltipProvider disableHoverableContent>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={active ? "secondary" : "ghost"}
                            className="w-full justify-start h-10 mb-1"
                            asChild
                          >
                            <Link href={href}>
                              <span
                                className={cn(isOpen === false ? "" : "mr-4")}
                              >
                                <Icon size={18} />
                              </span>
                              <p
                                className={cn(
                                  "max-w-[200px] truncate",
                                  isOpen === false
                                    ? "-translate-x-96 opacity-0"
                                    : "translate-x-0 opacity-100"
                                )}
                              >
                                {label}
                              </p>
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        {isOpen === false && (
                          <TooltipContent side="right">
                            {label}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ) : (
                  <div className="w-full" key={index}>
                    <CollapseMenuButton
                      icon={Icon}
                      label={label}
                      active={active}
                      submenus={submenus}
                      isOpen={isOpen}
                    />
                  </div>
                )
            )}
          </li>
        ))}
      </ul>
      <div className={cn(
        "mt-auto mb-5 px-2",
        isOpen === false ? "flex justify-center" : ""
      )}>
        <div className={cn(
          "flex items-center",
          isOpen === false ? "justify-center w-full" : "justify-start space-x-3"
        )}>
          <UserButton />
          {isOpen && user && (
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {user.firstName} {user.lastName}
              </span>
              <span className="text-xs text-muted-foreground">
                {user.primaryEmailAddress?.emailAddress}
              </span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}