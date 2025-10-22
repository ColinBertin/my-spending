import { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "My Spending App",
  description: "Track your spending with Firebase Auth",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", background: "#fafafa" }}>
        {children}
      </body>
    </html>
  );
}
