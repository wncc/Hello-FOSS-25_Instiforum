"use client";
import Link from "next/link";
import { IconBell, IconHome, IconLayoutDashboard, IconPlus, IconSettings } from "@tabler/icons-react";

const DebugFloatingDock = () => {
  const items = [
    { title: "Home", icon: <IconHome />, href: "/home" },
    { title: "Dashboard", icon: <IconLayoutDashboard />, href: "/dashboard" },
    { title: "Notifications", icon: <IconBell />, href: "/notifications" },
    { title: "Settings", icon: <IconSettings />, href: "/settings" },
    { title: "Create Post", icon: <IconPlus />, href: "/create" }
  ];

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md rounded-full px-6 py-3 shadow-xl border border-gray-200 z-50">
      <div className="flex items-center gap-4">
        {items.map((item) => (
          <Link 
            key={item.title} 
            href={item.href}
            className="p-3 rounded-full hover:bg-blue-100 transition-colors group"
            onClick={() => console.log(`Navigating to: ${item.href}`)}
          >
            <div className="w-6 h-6 text-gray-700 group-hover:text-blue-600">
              {item.icon}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DebugFloatingDock;