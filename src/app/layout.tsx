import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthContext";
import { CommonLayout } from "@/components/common/CommonLayout";
import {Outfit} from "next/font/google";

export const metadata: Metadata = {
  title: "Ensis Admin",
  description: "Admin console for Ensis products and categories",
};

const outfit = Outfit({ subsets: ["latin"], weight: "400", preload: true, variable: "--font-outfit" });


export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={outfit.variable}>
      <body>
        <AuthProvider>
          <CommonLayout>
            {children}
          </CommonLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
