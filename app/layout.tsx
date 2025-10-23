import { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "My Spending",
  description: "Track your spending with Firebase Auth",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="h-screen w-screen bg-gray-100">
        {children}
      </body>
    </html>
  );
}
