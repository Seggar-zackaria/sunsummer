import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sun Summer - Travel Agency",
  description: "Book flights and hotels for your perfect trip",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`antialiased ${geist.variable} font-sans`}
      >
        <SessionProvider>
          <main>
        
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
