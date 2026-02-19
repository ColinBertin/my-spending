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
    <div className="h-full w-full">
      <Navbar />
      {children}
    </div>
  );
}
