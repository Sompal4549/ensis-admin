import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react"; // Import Suspense
import { CommonLayout } from "@/components/common/CommonLayout";
import { AuthProvider } from "@/components/auth/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ensis Admin",
  description: "Admin panel for Ensis Wellness Equipment",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Suspense> {/* Wrap CommonLayout with Suspense */}
            <CommonLayout>
              {children}
            </CommonLayout>
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
