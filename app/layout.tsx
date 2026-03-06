import { ReactNode } from "react";
import "./globals.css";
import NotificationProvider from "../components/ui/NotificationProvider";

export const metadata = {
  title: "My Spending",
  description: "Track your spending with Supabase Auth",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen w-full overflow-x-hidden bg-gray-100">
        <NotificationProvider>{children}</NotificationProvider>
      </body>
    </html>
  );
}
