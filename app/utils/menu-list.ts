import {
    Tag,
    Users,
    Settings,
    Bookmark,
    SquarePen,
    Handshake,
    Braces,
    AreaChart,
    Cuboid,
    House,
  } from "lucide-react";

import {
    TbCloudDataConnection,
    TbDatabaseShare
} from "react-icons/tb";
import {
    SiOpenapiinitiative
} from "react-icons/si"
  
  type Submenu = {
    href: string;
    label: string;
    active: boolean;
  };
  
  type Menu = {
    href: string;
    label: string;
    active: boolean;
    icon: any;
    submenus: Submenu[];
  };
  
  type Group = {
    groupLabel: string;
    menus: Menu[];
  };
  
  export function getMenuList(pathname: string): Group[] {
    return [
      {
        groupLabel: "Management",
        menus: [
          {
            href: "/home",
            label: "Home",
            active: pathname.includes("/home"),
            icon: House,
            submenus: []
          },
          {
            href: "/sources",
            label: "Sources",
            active: pathname.includes("/sources"),
            icon: Braces,
            submenus: [
              {
                href: "/sources",
                label: "Manage Sources",
                active: pathname.includes("/sources"),
              },
            ]
          },
          {
            href: "/chat",
            label: "Generative Charts",
            active: pathname.includes("/chat"),
            icon: AreaChart,
            submenus: []
          },
          {
            href: "/saved-components",
            label: "Saved Components",
            active: pathname.includes("/saved-components"),
            icon: Cuboid,
            submenus: []
          }
        ]
      },
      {
        groupLabel: "Settings",
        menus: [
          {
            href: "/users",
            label: "Users",
            active: pathname.includes("/users"),
            icon: Users,
            submenus: []
          },
        ]
      },
    ];
  }