import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Metadata } from "next/types";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    template: "%s - My Spending",
    default: "My Spending",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
