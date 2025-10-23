import Navbar from "@/components/layout/Navbar";
import { ReactNode } from "react";

export const metadata = {
  title: "Dashboard - My Spending",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="h-full w-full">
      {/* <nav className="bg-white shadow-md p-4 mb-8">
      <h2 className="text-2xl font-bold">My Spending</h2>
    </nav> */}
      <Navbar />
      {children}
    </div>
  );
}
