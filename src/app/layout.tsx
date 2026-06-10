import type { Metadata } from "next";
import "./globals.css";
import { CommonLayout } from "@/components/common/CommonLayout";
import { Suspense } from "react"; // Import Suspense
import { AuthProvider } from "@/components/auth/AuthContext";
import { Montserrat, Cormorant_Garamond, Playfair_Display } from 'next/font/google';
export const metadata: Metadata = {
  title: "Ensis Admin",
  description: "Admin console for Ensis products and categories",
};

const montserrat = Montserrat({ subsets: ['latin'], weight: ['300','400','500','600','700'], variable: '--font-montserrat' });
const cormorant = Playfair_Display({ subsets: ['latin'], weight: ['400','600','700'], variable: '--font-cormorant' });

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
     <html lang="en" className={`${montserrat.variable} ${cormorant.variable}`}>
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
