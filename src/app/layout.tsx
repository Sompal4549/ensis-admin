import type { Metadata } from "next";
import "./globals.css";
import { CommonLayout } from "@/components/common/CommonLayout";

export const metadata: Metadata = {
  title: "Ensis Admin",
  description: "Admin console for Ensis products and categories",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <CommonLayout>
          {children}
        </CommonLayout>
      </body>
    </html>
  );
}
