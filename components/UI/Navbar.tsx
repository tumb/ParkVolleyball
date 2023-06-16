import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import icon from "@/assets/icon-512x512.png";
import NavForm from "./NavForm";
import Sidebar from "./Sidebar";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <header aria-label="Site Header" className="sticky top-0 z-50 bg-white">
      <div className="max-w-screen mx-auto px-4 shadow-md sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-1 md:flex md:items-center md:gap-12">
            <Link
              className="flex items-end justify-center text-teal-600"
              href="/"
            >
              <span className="sr-only">Home</span>
              <Image src={icon} alt="site-logo" width={40} />
              <span className="text-2xl font-semibold">Parkvball</span>
            </Link>
          </div>

          <div className="md:flex md:items-center md:gap-12">
            <nav aria-label="Site Nav" className="hidden md:block">
              <ul className="flex items-center gap-6 text-sm">
                <NavForm />
                <li>
                  <Link
                    className="text-gray-500 transition hover:text-gray-500/75"
                    href="/teams"
                  >
                    Teams
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-gray-500 transition hover:text-gray-500/75"
                    href="/rules"
                  >
                    Rules
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-gray-500 transition hover:text-gray-500/75"
                    href="/directions"
                  >
                    Directions
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-gray-500 transition hover:text-gray-500/75"
                    href="/signupinfo"
                  >
                    Signup Information
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="flex items-center gap-4">
              <div className="block md:hidden">
                <button
                  className="rounded bg-gray-100 p-2 text-gray-600 transition hover:text-gray-600/75"
                  onClick={(e) => {
                    setIsOpen(!isOpen);
                  }}
                >
                  {isOpen ? (
                    <div>
                      <svg
                        aria-hidden="true"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 18L18 6M6 6l12 12"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div>
                      <svg
                        aria-hidden="true"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4 6h16M4 12h16M4 18h16"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                      <span className="sr-only">Open menu</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
            {isOpen && (
              <div className="fixed left-0 top-16 flex h-screen w-screen flex-col">
                <Sidebar />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
