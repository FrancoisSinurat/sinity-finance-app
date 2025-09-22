"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ScrollText,
  User,
  Settings,
  LogOut,
  PanelRightOpen,
  PanelRightClose,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  {
    name: "Invoices",
    icon: ScrollText,
    children: [
      { name: "Pemasukkan", href: "/invoices/pemasukkan" },
      { name: "Pengeluaran", href: "/invoices/pengeluaran" },
    ],
  },
  { name: "Profile", icon: User, href: "/profile" },
  { name: "Settings", icon: Settings, href: "/settings" },
  { name: "Login", icon: Settings, href: "/login" },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <button className="p-2">
              <PanelRightOpen className="w-6 h-6 text-pink-600" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-pink-100">
            <SheetHeader className="p-4 border-b border-pink-200">
              <SheetTitle className="text-lg font-bold text-pink-700">
                Sinity Invoice
              </SheetTitle>
            </SheetHeader>
            <SidebarContent collapsed={false} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex flex-col h-screen bg-pink-100 shadow-lg border-r border-pink-200 transition-all duration-300 ease-in-out",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-pink-200">
          {!collapsed && (
            <span className="font-bold text-lg text-pink-700 whitespace-nowrap">
              <Link href="/">Sinity Invoice</Link>
            </span>
          )}
          {!collapsed ? (
            <PanelRightClose
              size={22}
              className="cursor-pointer text-pink-600 hover:text-pink-800 transition-transform duration-300 ml-2"
              onClick={() => setCollapsed(true)}
            />
          ) : (
            <PanelRightOpen
              size={22}
              className="cursor-pointer text-pink-600 hover:text-pink-800 transition-transform duration-300 ml-2"
              onClick={() => setCollapsed(false)}
            />
          )}
        </div>

        {/* Content */}
        <SidebarContent collapsed={collapsed} />
      </div>
    </>
  );
}

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);

  return (
    <>
      <nav className="flex-1 flex flex-col gap-1 p-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            (item.href && pathname.startsWith(item.href)) ||
            item.children?.some((c) => pathname.startsWith(c.href));

          if (item.children) {
            const isOpen = openMenu === item.name;
            return (
              <div key={item.name}>
                <button
                  onClick={() => setOpenMenu(isOpen ? null : item.name)}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 rounded-lg font-medium transition-all duration-200",
                    isActive
                      ? "bg-pink-200/60 text-pink-700 border-l-4 border-pink-500"
                      : "text-gray-700 hover:bg-pink-50 hover:text-pink-800"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} />
                    {!collapsed && <span>{item.name}</span>}
                  </div>
                  {!collapsed &&
                    (isOpen ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    ))}
                </button>

                {/* Submenu */}
                {isOpen && !collapsed && (
                  <div className="ml-8 mt-1 flex flex-col gap-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-sm transition-colors",
                          pathname.startsWith(child.href)
                            ? "bg-pink-200 text-pink-700 font-medium"
                            : "text-gray-600 hover:bg-pink-50 hover:text-pink-800"
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href!}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all duration-200",
                isActive
                  ? "bg-pink-200/60 text-pink-700 border-l-4 border-pink-500"
                  : "text-gray-700 hover:bg-pink-50 hover:text-pink-800"
              )}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-pink-200">
        <button className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-lg hover:bg-red-50 text-red-600 transition-colors duration-200 ease-in-out">
          <LogOut size={20} />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </>
  );
}
