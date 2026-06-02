
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ImageIcon, Folder } from "lucide-react";

export default function MediaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { label: "All Assets", href: "/media", icon: <ImageIcon size={18} /> },
    { label: "Home Page", href: "/media/home", icon: <Folder size={18} /> },
    { label: "About Page", href: "/media/about", icon: <Folder size={18} /> },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-[#8d6a3a]">Assets</span>
        <h1 className="font-serif text-4xl text-[#1f261b] mt-1">Media Gallery</h1>
        <p className="mt-3 text-[#5f5a50] max-w-2xl leading-relaxed">
          Browse and manage your uploaded assets. Copy image paths to use them across your website.
        </p>
      </header>

      <div className="flex gap-4 mb-8 border-b border-[#eee5d9] pb-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              pathname === item.href ? "bg-[#6f542f] text-white" : "text-[#5f5a50] hover:bg-[#f3eee6]"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}
