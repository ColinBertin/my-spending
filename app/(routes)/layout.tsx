import Navbar from "@/components/layout/Navbar";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col md:pl-[204px] lg:pl-[248px] print:pl-0">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
