import React, { useState } from "react";

export default function Tabs() {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [standingsOpen, setStandingsOpen] = useState(true);
  return (
    <div>
      <ul className="flex border-b border-gray-200 text-center">
        <li className="flex-1">
          <a
            className="relative block border-e border-s border-t border-gray-200 bg-white p-4 text-sm font-medium"
            href=""
          >
            <span className="absolute inset-x-0 -bottom-px h-px w-full bg-white"></span>
            Schedules 3:44
          </a>
        </li>

        <li className="flex-1">
          <a
            className={`block bg-gray-100 p-4 text-sm font-medium ring-1 ring-inset ring-white ${
              standingsOpen ? "" : "border-gray-200 bg-white text-gray-500"
            }}`}
            href=""
          >
            Standings
          </a>
        </li>
      </ul>
    </div>
  );
}
