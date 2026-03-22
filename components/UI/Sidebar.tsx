import Link from "next/link";
import React from "react";
import NavForm from "./NavForm";

export default function Sidebar() {
  return (
    <div className="sticky left-0 top-2 flex h-screen flex-col justify-between border-r bg-white">
      <div className="px-4 py-6">
        <nav
          aria-label="Main Nav"
          className="mt-6 flex flex-col space-y-1 overflow-clip"
        >
          <NavForm />
          <Link
            className="flex items-center rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            href="/admin"
          >
            Admin
          </Link>

          <Link
            className="flex items-center rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            href="/makeSchedule"
          >
            Schedule
          </Link>

          <Link
            className="flex items-center rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            href="/submitResults"
          >
            Submit
          </Link>

          <Link
            className="flex items-center rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            href="/teamOut"
          >
            Team Out
          </Link>

          <Link
            className="flex items-center rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            href="/playoffs"
          >
            Playoffs
          </Link>

          <Link
            className="flex items-center rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            href="/addPlayer"
          >
            New Players
          </Link>

          <Link
            className="flex items-center rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            href="/addLeague"
          >
            New League
          </Link>
        </nav>
      </div>
    </div>
  );
}
