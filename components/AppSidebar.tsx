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
  Moon,
  Sun,
  Menu,
  MessageCircle,
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
import { useTheme } from "@/lib/theme-provider";
import { logout } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { getThemeColor } from "@/lib/theme-utils";

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
  { name: "AI Assistant", icon: MessageCircle, href: "/assistant" },
  { name: "Profile", icon: User, href: "/profile" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [hoverExpand, setHoverExpand] = React.useState(false);
  const { colorTheme } = useTheme();

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "p-3 rounded-xl dark:bg-slate-950/90 backdrop-blur-xl shadow-lg dark:border-slate-800/50 hover:shadow-xl transition-all active:scale-95",
                colorTheme === "pink" && "bg-pink-50/90 border-pink-200/50",
                colorTheme === "sky" && "bg-sky-50/90 border-sky-200/50",
                colorTheme === "indigo" && "bg-indigo-50/90 border-indigo-200/50",
                colorTheme === "green" && "bg-green-50/90 border-green-200/50",
              )}
            >
              <Menu className={cn(
                "w-5 h-5 dark:text-slate-300",
                colorTheme === "pink" && "text-pink-600",
                colorTheme === "sky" && "text-sky-600",
                colorTheme === "indigo" && "text-indigo-600",
                colorTheme === "green" && "text-green-600",
              )} />
            </button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className={cn(
              "w-72 p-0 bg-gradient-to-b dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 backdrop-blur-xl border-r dark:border-slate-800/50",
              colorTheme === "pink" && "from-pink-50/95 via-pink-50/95 to-pink-50/95 border-pink-200/50",
              colorTheme === "sky" && "from-sky-50/95 via-sky-50/95 to-sky-50/95 border-sky-200/50",
              colorTheme === "indigo" && "from-indigo-50/95 via-indigo-50/95 to-indigo-50/95 border-indigo-200/50",
              colorTheme === "green" && "from-green-50/95 via-green-50/95 to-green-50/95 border-green-200/50",
            )}
          >
            <SheetHeader className={cn(
              "p-6 border-b dark:border-slate-800/50 bg-gradient-to-r dark:from-transparent dark:to-transparent",
              colorTheme === "pink" && "border-pink-200/50 from-pink-500/5 to-pink-500/5",
              colorTheme === "sky" && "border-sky-200/50 from-sky-500/5 to-sky-500/5",
              colorTheme === "indigo" && "border-indigo-200/50 from-indigo-500/5 to-indigo-500/5",
              colorTheme === "green" && "border-green-200/50 from-green-500/5 to-green-500/5",
            )}>
              <div className="flex items-center gap-3">
                <SheetTitle className={cn(
                  "text-xl font-bold bg-clip-text text-transparent",
                  colorTheme === "pink" && "bg-gradient-to-r from-pink-500 to-pink-500 dark:from-pink-400 dark:to-pink-400",
                  colorTheme === "sky" && "bg-gradient-to-r from-sky-500 to-sky-500 dark:from-sky-400 dark:to-sky-400",
                  colorTheme === "indigo" && "bg-gradient-to-r from-indigo-500 to-indigo-500 dark:from-indigo-400 dark:to-indigo-400",
                  colorTheme === "green" && "bg-gradient-to-r from-green-500 to-green-500 dark:from-green-400 dark:to-green-400",
                )}>
                  Sinity Finance
                </SheetTitle>
              </div>
            </SheetHeader>
            <SidebarContent collapsed={false} onItemClick={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex flex-col h-screen bg-gradient-to-b dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 backdrop-blur-xl shadow-2xl border-r dark:border-slate-800/50 transition-all duration-300 ease-in-out relative overflow-hidden",
          colorTheme === "pink" && "from-pink-50/95 via-pink-50/95 to-pink-50/95 border-pink-200/50",
          colorTheme === "sky" && "from-sky-50/95 via-sky-50/95 to-sky-50/95 border-sky-200/50",
          colorTheme === "indigo" && "from-indigo-50/95 via-indigo-50/95 to-indigo-50/95 border-indigo-200/50",
          colorTheme === "green" && "from-green-50/95 via-green-50/95 to-green-50/95 border-green-200/50",
          collapsed && !hoverExpand ? "w-20" : "w-72"
        )}
      >
        {/* Decorative gradient overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br via-transparent dark:from-transparent dark:via-transparent dark:to-transparent pointer-events-none",
          colorTheme === "pink" && "from-pink-500/5 to-pink-500/5",
          colorTheme === "sky" && "from-sky-500/5 to-sky-500/5",
          colorTheme === "indigo" && "from-indigo-500/5 to-indigo-500/5",
          colorTheme === "green" && "from-green-500/5 to-green-500/5",
        )} />
        
        {/* Header */}
        <div 
          className={cn(
            "relative flex items-center border-b dark:border-slate-800/50 bg-gradient-to-r dark:from-transparent dark:to-transparent",
            colorTheme === "pink" && "border-pink-200/50 from-pink-500/5 to-pink-500/5",
            colorTheme === "sky" && "border-sky-200/50 from-sky-500/5 to-sky-500/5",
            colorTheme === "indigo" && "border-indigo-200/50 from-indigo-500/5 to-indigo-500/5",
            colorTheme === "green" && "border-green-200/50 from-green-500/5 to-green-500/5",
            collapsed && !hoverExpand ? "justify-center p-4" : "justify-between p-5"
          )}
        >
          {(!collapsed || hoverExpand) && (
            <Link 
              href="/dashboard" 
              className={cn(
                "font-bold text-xl bg-clip-text text-transparent whitespace-nowrap flex items-center hover:opacity-80 transition-opacity flex-1",
                colorTheme === "pink" && "bg-gradient-to-r from-pink-500 to-pink-500 dark:from-pink-400 dark:to-pink-400",
                colorTheme === "sky" && "bg-gradient-to-r from-sky-500 to-sky-500 dark:from-sky-400 dark:to-sky-400",
                colorTheme === "indigo" && "bg-gradient-to-r from-indigo-500 to-indigo-500 dark:from-indigo-400 dark:to-indigo-400",
                colorTheme === "green" && "bg-gradient-to-r from-green-500 to-green-500 dark:from-green-400 dark:to-green-400",
              )}
            >
              Sinity Finance
            </Link>
          )}
          
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCollapsed(!collapsed);
              setHoverExpand(false);
            }}
            className={cn(
              "rounded-xl dark:hover:bg-slate-800/70 transition-colors duration-200 cursor-pointer",
              colorTheme === "pink" && "hover:bg-pink-100/70",
              colorTheme === "sky" && "hover:bg-sky-100/70",
              colorTheme === "indigo" && "hover:bg-indigo-100/70",
              colorTheme === "green" && "hover:bg-green-100/70",
              collapsed && !hoverExpand ? "p-2" : "p-2.5"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed && !hoverExpand ? (
              <PanelRightOpen className={cn(
                "w-5 h-5 dark:text-slate-300",
                colorTheme === "pink" && "text-pink-500",
                colorTheme === "sky" && "text-sky-500",
                colorTheme === "indigo" && "text-indigo-500",
                colorTheme === "green" && "text-green-500",
              )} />
            ) : (
              <PanelRightClose className={cn(
                "w-5 h-5 dark:text-slate-300",
                colorTheme === "pink" && "text-pink-500",
                colorTheme === "sky" && "text-sky-500",
                colorTheme === "indigo" && "text-indigo-500",
                colorTheme === "green" && "text-green-500",
              )} />
            )}
          </button>
        </div>

        {/* Content */}
        <div
          className="flex-1 flex flex-col overflow-hidden"
          onMouseEnter={() => {
            if (collapsed) {
              setHoverExpand(true);
            }
          }}
          onMouseLeave={() => {
            if (collapsed) {
              setHoverExpand(false);
            }
          }}
        >
          <SidebarContent collapsed={collapsed && !hoverExpand} hoverExpand={hoverExpand} />
        </div>
      </div>
    </>
  );
}

function SidebarContent({ collapsed, onItemClick, hoverExpand }: { collapsed: boolean; onItemClick?: () => void; hoverExpand?: boolean }) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);
  const { theme, toggleTheme, colorTheme } = useTheme();
  const isActuallyCollapsed = collapsed && !hoverExpand;
  const themeColors = getThemeColor(colorTheme);

  // Auto-close submenu when sidebar collapses
  React.useEffect(() => {
    if (isActuallyCollapsed) {
      setOpenMenu(null);
    }
  }, [isActuallyCollapsed]);

  return (
    <>
      <nav className={cn(
        "relative flex-1 flex flex-col overflow-y-auto",
        isActuallyCollapsed ? "gap-1 p-2" : "gap-2 p-4"
      )}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            (item.href && pathname.startsWith(item.href)) ||
            item.children?.some((c) => pathname.startsWith(c.href));

          if (item.children) {
            const isOpen = openMenu === item.name;
            const [showPopover, setShowPopover] = React.useState(false);
            const [clickedOpen, setClickedOpen] = React.useState(false);
            
            // Reset popover state when sidebar expands
            React.useEffect(() => {
              if (!isActuallyCollapsed) {
                setShowPopover(false);
                setClickedOpen(false);
              }
            }, [isActuallyCollapsed]);
            
            return (
              <div 
                key={item.name} 
                className="relative"
                onMouseEnter={() => {
                  if (isActuallyCollapsed && !clickedOpen) {
                    setShowPopover(true);
                  }
                }}
                onMouseLeave={() => {
                  if (isActuallyCollapsed && !clickedOpen) {
                    setShowPopover(false);
                  }
                }}
              >
                <button
                  onClick={() => {
                    if (isActuallyCollapsed) {
                      const newState = !showPopover;
                      setShowPopover(newState);
                      setClickedOpen(newState);
                    } else {
                      setOpenMenu(isOpen ? null : item.name);
                    }
                  }}
                  className={cn(
                    "flex items-center w-full rounded-xl font-medium transition-all duration-300 relative",
                    isActuallyCollapsed 
                      ? "justify-center px-2 py-2.5 cursor-pointer hover:scale-110 hover:shadow-lg active:scale-95" 
                      : "justify-between px-4 py-3",
                    isActive
                      ? isActuallyCollapsed
                        ? cn(
                            "bg-gradient-to-br text-white shadow-lg",
                            colorTheme === "pink" && "from-pink-400 to-pink-400",
                            colorTheme === "sky" && "from-sky-400 to-sky-400",
                            colorTheme === "indigo" && "from-indigo-400 to-indigo-400",
                            colorTheme === "green" && "from-green-400 to-green-400",
                          )
                        : cn(
                            "bg-gradient-to-r dark:from-slate-800/40 dark:via-slate-800/30 dark:to-slate-800/40 dark:text-slate-200 shadow-lg dark:shadow-slate-900/20 border-l-4 dark:border-slate-700",
                            colorTheme === "pink" && "from-pink-400/20 via-pink-400/15 to-pink-400/20 text-pink-600 shadow-pink-500/10 border-pink-400 dark:border-pink-500/50",
                            colorTheme === "sky" && "from-sky-400/20 via-sky-400/15 to-sky-400/20 text-sky-600 shadow-sky-500/10 border-sky-400 dark:border-sky-500/50",
                            colorTheme === "indigo" && "from-indigo-400/20 via-indigo-400/15 to-indigo-400/20 text-indigo-600 shadow-indigo-500/10 border-indigo-400 dark:border-indigo-500/50",
                            colorTheme === "green" && "from-green-400/20 via-green-400/15 to-green-400/20 text-green-600 shadow-green-500/10 border-green-400 dark:border-green-500/50",
                          )
                      : cn(
                          "text-neutral-700 dark:text-slate-200 dark:hover:from-slate-800/50 dark:hover:to-slate-800/30 dark:hover:text-slate-300 hover:shadow-md",
                          colorTheme === "pink" && "hover:bg-gradient-to-r hover:from-pink-50/80 hover:to-pink-50/80 hover:text-pink-600",
                          colorTheme === "sky" && "hover:bg-gradient-to-r hover:from-sky-50/80 hover:to-sky-50/80 hover:text-sky-600",
                          colorTheme === "indigo" && "hover:bg-gradient-to-r hover:from-indigo-50/80 hover:to-indigo-50/80 hover:text-indigo-600",
                          colorTheme === "green" && "hover:bg-gradient-to-r hover:from-green-50/80 hover:to-green-50/80 hover:text-green-600",
                        ),
                    isActuallyCollapsed && showPopover && cn(
                      "dark:from-slate-800/40 dark:to-slate-800/40 shadow-lg scale-105",
                      colorTheme === "pink" && "bg-gradient-to-br from-pink-400/30 to-pink-400/30",
                      colorTheme === "sky" && "bg-gradient-to-br from-sky-400/30 to-sky-400/30",
                      colorTheme === "indigo" && "bg-gradient-to-br from-indigo-400/30 to-indigo-400/30",
                      colorTheme === "green" && "bg-gradient-to-br from-green-400/30 to-green-400/30",
                    )
                  )}
                >
                  <div className={cn(
                    "flex items-center relative",
                    isActuallyCollapsed ? "justify-center" : "gap-3"
                  )}>
                    <div className={cn(
                      "rounded-lg transition-all relative",
                      isActuallyCollapsed ? "p-2" : "p-1.5",
                      isActive && !isActuallyCollapsed
                        ? cn(
                            "bg-gradient-to-br text-white shadow-md",
                            colorTheme === "pink" && "from-pink-400 to-pink-400",
                            colorTheme === "sky" && "from-sky-400 to-sky-400",
                            colorTheme === "indigo" && "from-indigo-400 to-indigo-400",
                            colorTheme === "green" && "from-green-400 to-green-400",
                          )
                        : isActive && isActuallyCollapsed
                        ? "bg-transparent"
                        : cn(
                            "dark:bg-slate-800/60 dark:text-slate-200 dark:group-hover:bg-slate-800/80",
                            colorTheme === "pink" && "bg-pink-100/50 text-pink-600 group-hover:bg-pink-200/70",
                            colorTheme === "sky" && "bg-sky-100/50 text-sky-600 group-hover:bg-sky-200/70",
                            colorTheme === "indigo" && "bg-indigo-100/50 text-indigo-600 group-hover:bg-indigo-200/70",
                            colorTheme === "green" && "bg-green-100/50 text-green-600 group-hover:bg-green-200/70",
                          ),
                      isActuallyCollapsed && showPopover && cn(
                        "ring-2 dark:ring-slate-700/50 ring-offset-2 ring-offset-transparent",
                        colorTheme === "pink" && "ring-pink-400/50",
                        colorTheme === "sky" && "ring-sky-400/50",
                        colorTheme === "indigo" && "ring-indigo-400/50",
                        colorTheme === "green" && "ring-green-400/50",
                      )
                    )}>
                      <Icon size={isActuallyCollapsed ? 20 : 18} />
                      {/* Icon kecil di pojok kanan bawah untuk menunjukkan ada submenu */}
                      {isActuallyCollapsed && (
                        <div className={cn(
                          "absolute -bottom-0.5 -right-0.5 bg-gradient-to-br dark:from-slate-700 dark:to-slate-600 rounded-full p-0.5 border border-white dark:border-slate-900 shadow-sm",
                          colorTheme === "pink" && "from-pink-400 to-pink-500",
                          colorTheme === "sky" && "from-sky-400 to-sky-500",
                          colorTheme === "indigo" && "from-indigo-400 to-indigo-500",
                          colorTheme === "green" && "from-green-400 to-green-500",
                        )}>
                          <ChevronRight size={8} className="text-white" />
                        </div>
                      )}
                    </div>
                    {!isActuallyCollapsed && (
                      <span className="overflow-hidden">
                        {item.name}
                      </span>
                    )}
                  </div>
                  {!isActuallyCollapsed && (
                    <ChevronDown size={16} className={cn("transition-transform duration-200", isOpen && "rotate-180")} />
                  )}
                </button>

                {/* Submenu - Expanded */}
                {!isActuallyCollapsed && isOpen && (
                  <div className="ml-4 mt-2 flex flex-col gap-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        onClick={onItemClick}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-colors duration-200 relative group",
                          pathname.startsWith(child.href)
                            ? cn(
                                "dark:from-slate-800/40 dark:to-slate-800/40 dark:text-slate-300 font-semibold shadow-md dark:shadow-slate-900/20",
                                colorTheme === "pink" && "bg-gradient-to-r from-pink-400/25 to-pink-400/25 text-pink-600 shadow-pink-500/5",
                                colorTheme === "sky" && "bg-gradient-to-r from-sky-400/25 to-sky-400/25 text-sky-600 shadow-sky-500/5",
                                colorTheme === "indigo" && "bg-gradient-to-r from-indigo-400/25 to-indigo-400/25 text-indigo-600 shadow-indigo-500/5",
                                colorTheme === "green" && "bg-gradient-to-r from-green-400/25 to-green-400/25 text-green-600 shadow-green-500/5",
                              )
                            : cn(
                                "text-neutral-600 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-slate-200",
                                colorTheme === "pink" && "hover:bg-pink-50/70 hover:text-pink-600",
                                colorTheme === "sky" && "hover:bg-sky-50/70 hover:text-sky-600",
                                colorTheme === "indigo" && "hover:bg-indigo-50/70 hover:text-indigo-600",
                                colorTheme === "green" && "hover:bg-green-50/70 hover:text-green-600",
                              )
                        )}
                      >
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full transition-colors",
                          pathname.startsWith(child.href)
                            ? cn(
                                "dark:bg-slate-600",
                                colorTheme === "pink" && "bg-pink-500",
                                colorTheme === "sky" && "bg-sky-500",
                                colorTheme === "indigo" && "bg-indigo-500",
                                colorTheme === "green" && "bg-green-500",
                              )
                            : cn(
                                "bg-transparent dark:group-hover:bg-slate-700/50",
                                colorTheme === "pink" && "group-hover:bg-pink-400/50",
                                colorTheme === "sky" && "group-hover:bg-sky-400/50",
                                colorTheme === "indigo" && "group-hover:bg-indigo-400/50",
                                colorTheme === "green" && "group-hover:bg-green-400/50",
                              )
                        )} />
                        <span>{child.name}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Submenu Popover - Collapsed */}
                {isActuallyCollapsed && showPopover && (
                  <div 
                    className="absolute left-full top-0 ml-2 z-[100]"
                    onMouseEnter={() => setShowPopover(true)}
                    onMouseLeave={() => {
                      if (!clickedOpen) {
                        setShowPopover(false);
                      }
                    }}
                  >
                    <div className={cn(
                      "dark:bg-slate-950/95 backdrop-blur-xl rounded-xl shadow-2xl dark:border-slate-800/50 py-2 min-w-[180px]",
                      colorTheme === "pink" && "bg-pink-50/95 border-pink-200/50",
                      colorTheme === "sky" && "bg-sky-50/95 border-sky-200/50",
                      colorTheme === "indigo" && "bg-indigo-50/95 border-indigo-200/50",
                      colorTheme === "green" && "bg-green-50/95 border-green-200/50",
                    )}>
                      <div className={cn(
                        "px-3 py-2 text-xs font-semibold dark:text-slate-300 dark:border-slate-800/50 mb-1 border-b",
                        colorTheme === "pink" && "text-pink-600 border-pink-200/50",
                        colorTheme === "sky" && "text-sky-600 border-sky-200/50",
                        colorTheme === "indigo" && "text-indigo-600 border-indigo-200/50",
                        colorTheme === "green" && "text-green-600 border-green-200/50",
                      )}>
                        {item.name}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            onClick={() => {
                              setShowPopover(false);
                              setClickedOpen(false);
                              onItemClick?.();
                            }}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 mx-1 rounded-lg text-sm transition-colors duration-200 relative group/submenu",
                              pathname.startsWith(child.href)
                                ? cn(
                                    "dark:from-slate-800/40 dark:to-slate-800/40 dark:text-slate-300 font-semibold",
                                    colorTheme === "pink" && "bg-gradient-to-r from-pink-400/25 to-pink-400/25 text-pink-600",
                                    colorTheme === "sky" && "bg-gradient-to-r from-sky-400/25 to-sky-400/25 text-sky-600",
                                    colorTheme === "indigo" && "bg-gradient-to-r from-indigo-400/25 to-indigo-400/25 text-indigo-600",
                                    colorTheme === "green" && "bg-gradient-to-r from-green-400/25 to-green-400/25 text-green-600",
                                  )
                                : cn(
                                    "text-neutral-600 dark:text-neutral-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-400",
                                    colorTheme === "pink" && "hover:bg-pink-50/70 hover:text-pink-600",
                                    colorTheme === "sky" && "hover:bg-sky-50/70 hover:text-sky-600",
                                    colorTheme === "indigo" && "hover:bg-indigo-50/70 hover:text-indigo-600",
                                    colorTheme === "green" && "hover:bg-green-50/70 hover:text-green-600",
                                  )
                            )}
                          >
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full transition-colors",
                              pathname.startsWith(child.href)
                                ? cn(
                                    "dark:bg-slate-600",
                                    colorTheme === "pink" && "bg-pink-500",
                                    colorTheme === "sky" && "bg-sky-500",
                                    colorTheme === "indigo" && "bg-indigo-500",
                                    colorTheme === "green" && "bg-green-500",
                                  )
                                : cn(
                                    "bg-transparent dark:group-hover/submenu:bg-slate-700/50",
                                    colorTheme === "pink" && "group-hover/submenu:bg-pink-400/50",
                                    colorTheme === "sky" && "group-hover/submenu:bg-sky-400/50",
                                    colorTheme === "indigo" && "group-hover/submenu:bg-indigo-400/50",
                                    colorTheme === "green" && "group-hover/submenu:bg-green-400/50",
                                  )
                            )} />
                            <span>{child.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                    {/* Arrow */}
                    <div className="absolute left-0 top-4 -translate-x-1/2">
                      <div className={cn(
                        "w-2.5 h-2.5 dark:bg-slate-950/95 border-l border-b dark:border-slate-800/50 rotate-45",
                        colorTheme === "pink" && "bg-pink-50/95 border-pink-200/50",
                        colorTheme === "sky" && "bg-sky-50/95 border-sky-200/50",
                        colorTheme === "indigo" && "bg-indigo-50/95 border-indigo-200/50",
                        colorTheme === "green" && "bg-green-50/95 border-green-200/50",
                      )}></div>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href!}
              onClick={onItemClick}
              className={cn(
                "flex items-center rounded-xl font-medium transition-colors duration-200 relative group",
                isActuallyCollapsed 
                  ? "justify-center px-2 py-2.5" 
                  : "gap-3 px-4 py-3",
                isActive
                  ? isActuallyCollapsed
                    ? cn(
                        "bg-gradient-to-br text-white shadow-lg",
                        colorTheme === "pink" && "from-pink-400 to-pink-400",
                        colorTheme === "sky" && "from-sky-400 to-sky-400",
                        colorTheme === "indigo" && "from-indigo-400 to-indigo-400",
                        colorTheme === "green" && "from-green-400 to-green-400",
                      )
                    : cn(
                        "bg-gradient-to-r dark:from-slate-800/40 dark:via-slate-800/30 dark:to-slate-800/40 dark:text-slate-200 shadow-lg dark:shadow-slate-900/20 border-l-4 dark:border-slate-700",
                        colorTheme === "pink" && "from-pink-400/20 via-pink-400/15 to-pink-400/20 text-pink-600 shadow-pink-500/10 border-pink-400 dark:border-pink-500/50",
                        colorTheme === "sky" && "from-sky-400/20 via-sky-400/15 to-sky-400/20 text-sky-600 shadow-sky-500/10 border-sky-400 dark:border-sky-500/50",
                        colorTheme === "indigo" && "from-indigo-400/20 via-indigo-400/15 to-indigo-400/20 text-indigo-600 shadow-indigo-500/10 border-indigo-400 dark:border-indigo-500/50",
                        colorTheme === "green" && "from-green-400/20 via-green-400/15 to-green-400/20 text-green-600 shadow-green-500/10 border-green-400 dark:border-green-500/50",
                      )
                  : cn(
                      "text-neutral-700 dark:text-slate-200 dark:hover:from-slate-800/50 dark:hover:to-slate-800/30 dark:hover:text-slate-300 hover:shadow-md",
                      colorTheme === "pink" && "hover:bg-gradient-to-r hover:from-pink-50/80 hover:to-pink-50/80 hover:text-pink-600",
                      colorTheme === "sky" && "hover:bg-gradient-to-r hover:from-sky-50/80 hover:to-sky-50/80 hover:text-sky-600",
                      colorTheme === "indigo" && "hover:bg-gradient-to-r hover:from-indigo-50/80 hover:to-indigo-50/80 hover:text-indigo-600",
                      colorTheme === "green" && "hover:bg-gradient-to-r hover:from-green-50/80 hover:to-green-50/80 hover:text-green-600",
                    )
              )}
            >
              <div className={cn(
                "rounded-lg transition-colors",
                isActuallyCollapsed ? "p-2" : "p-1.5",
                isActive && !isActuallyCollapsed
                  ? cn(
                      "bg-gradient-to-br text-white shadow-md",
                      colorTheme === "pink" && "from-pink-400 to-pink-400",
                      colorTheme === "sky" && "from-sky-400 to-sky-400",
                      colorTheme === "indigo" && "from-indigo-400 to-indigo-400",
                      colorTheme === "green" && "from-green-400 to-green-400",
                    )
                  : isActive && isActuallyCollapsed
                  ? "bg-transparent"
                  : cn(
                      "dark:bg-slate-800/60 dark:text-slate-200 dark:group-hover:bg-slate-800/80",
                      colorTheme === "pink" && "bg-pink-100/50 text-pink-600 group-hover:bg-pink-200/70",
                      colorTheme === "sky" && "bg-sky-100/50 text-sky-600 group-hover:bg-sky-200/70",
                      colorTheme === "indigo" && "bg-indigo-100/50 text-indigo-600 group-hover:bg-indigo-200/70",
                      colorTheme === "green" && "bg-green-100/50 text-green-600 group-hover:bg-green-200/70",
                    )
              )}>
                <Icon size={isActuallyCollapsed ? 20 : 18} />
              </div>
              {!isActuallyCollapsed && (
                <span className="overflow-hidden">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle & Logout */}
      <div className={cn(
        "relative border-t dark:border-slate-800/50 bg-gradient-to-t dark:from-transparent to-transparent",
        colorTheme === "pink" && "border-pink-200/50 from-pink-500/5",
        colorTheme === "sky" && "border-sky-200/50 from-sky-500/5",
        colorTheme === "indigo" && "border-indigo-200/50 from-indigo-500/5",
        colorTheme === "green" && "border-green-200/50 from-green-500/5",
        isActuallyCollapsed ? "p-2 space-y-1" : "p-4 space-y-2"
      )}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            "flex items-center w-full rounded-xl font-medium transition-colors duration-200 text-neutral-700 dark:text-slate-200 dark:hover:from-slate-800/50 dark:hover:to-slate-800/30 dark:hover:text-slate-300 hover:shadow-md group",
            colorTheme === "pink" && "hover:bg-gradient-to-r hover:from-pink-50/80 hover:to-pink-50/80 hover:text-pink-600",
            colorTheme === "sky" && "hover:bg-gradient-to-r hover:from-sky-50/80 hover:to-sky-50/80 hover:text-sky-600",
            colorTheme === "indigo" && "hover:bg-gradient-to-r hover:from-indigo-50/80 hover:to-indigo-50/80 hover:text-indigo-600",
            colorTheme === "green" && "hover:bg-gradient-to-r hover:from-green-50/80 hover:to-green-50/80 hover:text-green-600",
            isActuallyCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-4 py-3"
          )}
        >
          <div className={cn(
            "rounded-lg dark:bg-slate-800/60 dark:text-slate-200 dark:group-hover:bg-slate-800/80 transition-colors",
            colorTheme === "pink" && "bg-pink-100/50 text-pink-600 group-hover:bg-pink-200/70",
            colorTheme === "sky" && "bg-sky-100/50 text-sky-600 group-hover:bg-sky-200/70",
            colorTheme === "indigo" && "bg-indigo-100/50 text-indigo-600 group-hover:bg-indigo-200/70",
            colorTheme === "green" && "bg-green-100/50 text-green-600 group-hover:bg-green-200/70",
            isActuallyCollapsed ? "p-2" : "p-1.5"
          )}>
            {theme === "light" ? (
              <Moon size={isActuallyCollapsed ? 20 : 18} />
            ) : (
              <Sun size={isActuallyCollapsed ? 20 : 18} />
            )}
          </div>
          {!isActuallyCollapsed && (
            <span className="overflow-hidden">
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </span>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className={cn(
            "flex items-center w-full rounded-xl font-medium transition-colors duration-200 text-red-600 dark:text-red-400 hover:bg-red-50/70 dark:hover:bg-red-900/20 hover:shadow-md group",
            isActuallyCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-4 py-3"
          )}
        >
          <div className={cn(
            "rounded-lg bg-red-100/50 dark:bg-red-900/20 text-red-600 dark:text-red-400 group-hover:bg-red-200/70 dark:group-hover:bg-red-900/40 transition-colors",
            isActuallyCollapsed ? "p-2" : "p-1.5"
          )}>
            <LogOut size={isActuallyCollapsed ? 20 : 18} />
          </div>
          {!isActuallyCollapsed && (
            <span className="overflow-hidden">
              Logout
            </span>
          )}
        </button>
      </div>
    </>
  );
}
