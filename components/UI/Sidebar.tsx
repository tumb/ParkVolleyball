import Link from "next/link";
import React from "react";
import NavForm from "./NavForm";

export default function Sidebar() {
  return (
    <div className="sticky left-0 top-2 flex h-screen flex-col justify-between border-r bg-white">
      <div className="px-4 py-6">
        <nav aria-label="Main Nav" className="mt-6 flex flex-col overflow-clip">
          <ul className="flex-col items-center space-y-4 text-sm">
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
                href="/map"
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
      </div>
    </div>
  );
}
