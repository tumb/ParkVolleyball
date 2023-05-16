import React, { useState } from "react";

export default function UnderLineTabs() {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [standingsOpen, setStandingsOpen] = useState(true);

  const handleTabClick = () => {
    setScheduleOpen(!scheduleOpen);
    setStandingsOpen(!standingsOpen);
  };

  return (
    <div>
      <ul className="flex border-b border-gray-100">
        <li className="flex-1">
          <button
            className="relative flex w-full items-center justify-center p-4"
            onClick={() => {
              setScheduleOpen(true);
              setStandingsOpen(false);
            }}
          >
            {scheduleOpen && (
              <span className="absolute inset-x-0 -bottom-px h-px w-full bg-pink-600"></span>
            )}

            <div className="flex items-center justify-center gap-4">
              <span className="text-sm font-medium text-gray-900">
                Schdeule
              </span>
            </div>
          </button>
        </li>

        <li className="flex-1">
          <button
            className="relative flex w-full items-center justify-center p-4"
            onClick={() => {
              setScheduleOpen(false);
              setStandingsOpen(true);
            }}
          >
            {standingsOpen && (
              <span className="absolute inset-x-0 -bottom-px h-px w-full bg-pink-600"></span>
            )}
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm font-medium text-gray-900">
                Standings
              </span>
            </div>
          </button>
        </li>
      </ul>
    </div>
  );
}
