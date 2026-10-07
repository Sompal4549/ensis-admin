import type { Metadata } from "next";
import "./globals.css";
import { CommonLayout } from "@/components/common/CommonLayout";
import { Suspense } from "react"; // Import Suspense
import { AuthProvider } from "@/components/auth/AuthContext";
import { Montserrat } from 'next/font/google';
export const metadata: Metadata = {
  title: "Ensis Admin",
  description: "Admin console for Ensis products and categories",
};

const montserrat = Montserrat({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-montserrat' });

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body>
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
