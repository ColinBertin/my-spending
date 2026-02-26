"use client";
import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/utils/authClient";

// type menuProps = {
//   menuState: boolean;
//   handleNavbar?: () => void;
// };

export default function Menu({ onItemClick }: { onItemClick?: () => void }) {
  const router = useRouter();

  async function handleLogout() {
    onItemClick?.();
    await signOut();
    router.push("/login");
  }

  const pathname = usePathname();
  const isSamePath = (p: string) => pathname?.endsWith(p);

  const sections = [
    { title: "Dashboard", href: "/" },
    { title: "New Account", href: "/accounts/create" },
    { title: "New Category", href: "/categories/create" },
    { title: "Pro: Generate Ledger", href: "/ledger-generator" },
  ];

  return (
    <>
      <ul className={clsx("text-center md:text-start")}>
        {sections.map((section) => (
          <Link key={section.title} href={section.href} onClick={onItemClick}>
            <li
              className={`${
                isSamePath(section.href)
                  ? "text-orange-light border-orange-light"
                  : "text-white border-white md:border-gray-200"
              } text-xl md:text-base py-5 md:py-3 border-b-2 md:border-b hover:text-orange-light hover:border-orange-light cursor-pointer`}
            >
              {section.title}
            </li>
          </Link>
        ))}
      </ul>
      <button
        className="text-center md:text-start text-white border-white md:border-gray-200 text-xl md:text-base py-5 md:py-3 border-b-2 md:border-b hover:text-orange-light hover:border-orange-light cursor-pointer"
        onClick={handleLogout}
      >
        Logout
      </button>
    </>
  );
}
