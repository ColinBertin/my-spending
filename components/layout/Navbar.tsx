"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import logo from "@/public/images/yen-icon.png";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoCloseOutline } from "react-icons/io5";
import { Transition } from "@headlessui/react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/utils/authClient";
import clsx from "clsx";
import Link from "next/link";
import { Instrument_Sans } from "next/font/google";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Accounts", href: "/accounts/create" },
  { label: "Categories", href: "/categories/create" },
  { label: "Ledger", href: "/categories/create" },
  { label: "Reports", href: "/categories/create" },
  { label: "Settings", href: "/categories/create" },
];

export default function NavBar() {
  const drawerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const isSamePath = (href: string) => pathname?.endsWith(href);

  async function handleLogout() {
    closeDrawer();
    await signOut();
    router.push("/login");
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        closeDrawer();
      }
    };

    if (drawerOpen) {
      document.addEventListener("click", handleClickOutside);
      document.body.classList.add("overflow-y-hidden", "md:overflow-y-auto");
    } else {
      document.removeEventListener("click", handleClickOutside);
      document.body.classList.remove("overflow-y-hidden", "md:overflow-y-auto");
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [drawerOpen, closeDrawer]);

  return (
    <>
      {/* PERSISTENT SIDEBAR — tablet 204px / desktop 248px */}
      <aside
        className={clsx(
          instrumentSans.className,
          "print-hidden fixed inset-y-0 left-0 z-30 hidden md:flex md:w-[204px] lg:w-[248px] flex-col bg-[#F1EEE8] border-r border-[#E3DFD7]",
        )}
      >
        <div className="flex items-center gap-[10px] border-b border-[#E3DFD7] px-4 py-4">
          <Image
            src={logo}
            alt="My Finances"
            className="h-[26px] w-[26px] rounded-[7px] object-cover"
          />
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-[#17161A]">
            My Finances
          </span>
        </div>

        <nav className="flex flex-col gap-[2px] px-2 py-[10px]">
          {navItems.map((item) => {
            const active = isSamePath(item.href);
            return (
              <Link key={item.label} href={item.href}>
                <span
                  className={clsx(
                    "flex h-[38px] w-full items-center gap-[11px] rounded-[9px] px-3 text-left text-[13px] font-medium transition-colors",
                    active
                      ? "bg-white text-[#17161A] shadow-[0_1px_2px_rgba(23,22,26,.06)]"
                      : "text-[#6B6760] hover:bg-white/70",
                  )}
                >
                  <span
                    className={clsx(
                      "h-2 w-2 flex-none rounded-[2px]",
                      active ? "bg-[#E8552F]" : "bg-[#C9C3B7]",
                    )}
                  />
                  <span className="whitespace-nowrap">{item.label}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-[#E3DFD7] px-2 pb-[14px] pt-3">
          <Link
            href="/ledger-generator"
            className="flex h-[38px] w-full items-center gap-[10px] rounded-[9px] border border-[#E3DFD7] bg-white px-3 text-[12px] font-medium text-[#3B3934] transition-colors hover:bg-[#FBFAF7]"
          >
            <span className="h-[7px] w-[7px] flex-none rounded-[2px] bg-[#E8552F]" />
            <span className="whitespace-nowrap">Pro · Generate ledger</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-[10px] px-1 py-1 text-left transition-opacity hover:opacity-80"
          >
            <span className="h-[26px] w-[26px] flex-none rounded-full bg-[#DCD7CB]" />
            <span className="min-w-0">
              <span className="block truncate text-[12px] font-medium text-[#17161A]">
                Log out
              </span>
              <span className="block text-[11px] text-[#5C5952]">
                End your session
              </span>
            </span>
          </button>
        </div>
      </aside>

      {/* MOBILE STICKY HEADER */}
      <header
        className={clsx(
          instrumentSans.className,
          "print-hidden sticky top-0 z-40 flex items-center justify-between gap-[10px] border-b border-[#E3DFD7] bg-[#F7F5F1]/[0.92] px-4 py-3 backdrop-blur-sm md:hidden",
        )}
      >
        <div className="flex items-center gap-[9px]">
          <Image
            src={logo}
            alt="My Finances"
            className="h-6 w-6 rounded-[6px] object-cover"
          />
          <span className="text-[14px] font-semibold text-[#17161A]">
            My Finances
          </span>
        </div>
        <button
          className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-[#E3DFD7] bg-white text-[#17161A]"
          onClick={toggleDrawer}
        >
          {drawerOpen ? (
            <IoCloseOutline className="h-[18px] w-[18px]" />
          ) : (
            <RxHamburgerMenu className="h-[18px] w-[18px]" />
          )}
        </button>
      </header>

      {/* MOBILE DRAWER */}
      <Transition
        as={Fragment}
        show={drawerOpen}
        enter="transition ease-out duration-150"
        enterFrom="transform opacity-0 -translate-y-1"
        enterTo="transform opacity-100 translate-y-0"
        leave="transition ease-in duration-100"
        leaveFrom="transform opacity-100 translate-y-0"
        leaveTo="transform opacity-0 -translate-y-1"
      >
        <div
          ref={drawerRef}
          className={clsx(
            instrumentSans.className,
            "print-hidden sticky top-[65px] z-40 grid grid-cols-2 gap-[6px] border-b border-[#E3DFD7] bg-white px-3 pb-3 pt-2 md:hidden",
          )}
        >
          {navItems.map((item) => {
            const active = isSamePath(item.href);
            return (
              <Link key={item.label} href={item.href} onClick={closeDrawer}>
                <span
                  className={clsx(
                    "flex h-10 w-full items-center justify-center rounded-[9px] border text-[12px] font-medium",
                    active
                      ? "border-[#17161A] bg-[#17161A] text-[#F7F5F1]"
                      : "border-[#E3DFD7] bg-[#FBFAF7] text-[#3B3934]",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-10 w-full items-center justify-center rounded-[9px] border border-[#E3DFD7] bg-[#FBFAF7] text-[12px] font-medium text-[#3B3934]"
          >
            Log out
          </button>
        </div>
      </Transition>
    </>
  );
}
