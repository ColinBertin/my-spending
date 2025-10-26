"use client";

import { useCallback, useEffect, useRef, useState } from "react";
// import Link from "next/link";
// import Image from "next/image";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoCloseOutline } from "react-icons/io5";
import Menu from "../Menu";
import { Transition } from "@headlessui/react";
import clsx from "clsx";
import Link from "next/link";

export default function NavBar() {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [navbar, setNavbar] = useState(false);

  const handleNavbar = useCallback(() => {
    setNavbar(!navbar);
  }, [navbar]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        handleNavbar?.();
      }
    };

    if (navbar) {
      document.addEventListener("click", handleClickOutside);
      document.body.classList.add("overflow-y-hidden", "md:overflow-y-auto");
    } else {
      document.removeEventListener("click", handleClickOutside);
      document.body.classList.remove("overflow-y-hidden", "md:overflow-y-auto");
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [navbar, handleNavbar]);

  return (
    <>
      <nav className="w-full fixed top-0 left-0 bg-gray-800 flex justify-between px-6 py-2 z-50">
        {/* LOGO */}
        <Link href="/dashboard" className="flex items-center space-x-2">
          <h2 className="text-white text-2xl font-bold">My Spending</h2>
        </Link>
        {/* HAMBURGER BUTTON */}
        <button
          className="text-white rounded-md outline-none hover:text-gold-500 transition ease-in duration-100 cursor-pointer"
          onClick={handleNavbar}
        >
          {navbar ? (
            <IoCloseOutline className="h-6 w-6 md:h-8 md:w-8" />
          ) : (
            <RxHamburgerMenu className="h-6 w-6 md:h-8 md:w-8" />
          )}
        </button>
      </nav>
      {/* MENU ITEMS */}
      <Transition
        show={navbar}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div
          ref={dropdownRef}
          className={clsx(
            navbar
              ? "fixed md:top-10 md:right-5 h-screen w-screen md:w-52 md:h-80"
              : "hidden",
            "flex flex-col justify-center px-20 md:px-6 md:pt-2 md:pb-6 bg-gray-800 md:mt-8 z-40 md:shadow-[0_4px_50px_5px_rgba(100,100,100,0.1)] md:rounded"
          )}
        >
          <Menu />
        </div>
      </Transition>
    </>
  );
}
