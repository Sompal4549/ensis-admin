"use client";

import { useAuth } from "@/components/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function withRole(Component: React.ComponentType<any>, allowedRoles: string[]) {
  return function RoleProtected(props: any) {
    const { user, isReady } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (isReady && (!user || !allowedRoles.includes(user.role.toLowerCase()))) {
        router.replace("/");
      }
    }, [user, isReady, router]);

    if (!isReady || !user || !allowedRoles.includes(user.role.toLowerCase())) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      );
    }

    return <Component {...props} />;
  };
}