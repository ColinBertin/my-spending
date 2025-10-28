import Navbar from "@/components/layout/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ReactNode } from "react";

export const metadata = {
  title: "Add Category - My Spending",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="h-full w-full border-2 border-green-500">
        <Navbar />
        {children}
      </div>
    </ProtectedRoute>
  );
}