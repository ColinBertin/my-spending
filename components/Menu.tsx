"use client";
// import clsx from "clsx";
// import Link from "next/link";
// import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/app/lib/firebase";

// type menuProps = {
//   menuState: boolean;
//   handleNavbar?: () => void;
// };

export default function Menu() {
  const router = useRouter();

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  // const pathname = usePathname();
  // const isSamePath = (p: string) => pathname?.endsWith(p);

  // const sections = [
  //   {
  //     title: "Home",
  //     href: "/",
  //   },
  //   {
  //     title: "Mariage",
  //     href: "/wedding",
  //   },
  //   {
  //     title: "Maternité",
  //     href: "/maternity",
  //   },
  //   {
  //     title: "Nouveau Né",
  //     href: "/newBorn",
  //   },
  //   {
  //     title: "Évènement",
  //     href: "/event",
  //   },
  //   {
  //     title: "À propos",
  //     href: "/about-me",
  //   },
  //   // {
  //   //   title: "Contact",
  //   //   href: "/about-me/#contact-form",
  //   // },
  // ];

  return (
    <>
      <button
        className="bg-gray-700 hover:bg-gray-500 text-white text-center font-semibold py-2 px-4 rounded-3xl self-center w-56 sm:w-36"
        onClick={handleLogout}
      >
        Logout
      </button>
      {/* <ul
        className={clsx(
          menuState && "-mt-16 md:mt-0",
          "text-center md:text-start"
        )}
      >
        {sections.map((section) => (
          <Link key={section.title} href={section.href} onClick={handleNavbar}>
            <li
              className={`${
                isSamePath(section.href)
                  ? "text-gold-500 border-gold-500"
                  : "text-white border-white md:border-gray-200"
              } text-xl md:text-base py-5 md:py-3 border-b-2 md:border-b hover:text-gold-500 hover:border-gold-500 cursor-pointer`}
            >
              {section.title}
            </li>
          </Link>
        ))}
      </ul> */}
    </>
  );
}
