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
    TextSearch,
    RadioTower,
    ArrowDownUp,
    MapPinned,
    Database
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
            href: "/query",
            label: "Query Tool",
            active: pathname.includes("/query"),
            icon: Braces,
            submenus: []
          },
          {
            href: "/connectors",
            label: "Connectors",
            active: pathname.includes("/connectors"),
            icon: Database,
            submenus: [
              {
                href: "/warehouses",
                label: "Manage Connections",
                active: pathname.includes("/warehouses"),
              },
              {
                href: "/warehouses/add",
                label: "Add Connections",
                active: pathname.includes("/warehouses/add"),
              },
            ]
          },
          {
            href: "/broadcasts",
            label: "Broadcasts",
            active: pathname.includes("/broadcasts"),
            icon: RadioTower,
            submenus: []
          },
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