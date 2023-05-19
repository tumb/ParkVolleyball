import { ScheduleData } from "@/lib/types";
import React from "react";

const textColor = (schedule: ScheduleData) => {
  if (
    schedule.divisionid?.divisionname === "Red" ||
    schedule.divisionid?.divisionname === "red"
  ) {
    return "text-red-600";
  } else if (
    schedule.divisionid?.divisionname === "Green" ||
    schedule.divisionid?.divisionname === "green"
  ) {
    return "text-green-600";
  } else if (
    schedule.divisionid?.divisionname === "Blue" ||
    schedule.divisionid?.divisionname === "blue"
  ) {
    return "text-blue-600";
  } else {
    return "text-gray-700";
  }
};

export default function ScheduleTable({
  schedules,
}: {
  schedules: ScheduleData[] | null | undefined;
}) {
  if (schedules === null) {
    return (
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg">
          <h1 className="text-center text-2xl font-bold text-indigo-600 sm:text-3xl">
            No Schedules available!
          </h1>
        </div>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border">
      <h1 className="py-12 text-center text-2xl font-semibold text-indigo-600">
        Schedules
      </h1>

      <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
        <thead className="text-center">
          <tr>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Match Date
            </th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Division
            </th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Team 1
            </th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              VS
            </th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Team2
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 text-center">
          {schedules?.map((schedule: ScheduleData) => (
            <tr
              className="odd:bg-gray-50 hover:shadow"
              key={schedule.scheduleid}
            >
              <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                {new Date(schedule.matchdate).toDateString()}
              </td>
              <td
                className={`whitespace-nowrap px-4 py-2 font-medium ${textColor(
                  schedule
                )}
                `}
              >
                {schedule.divisionid?.divisionname}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                {schedule.team1.teamname}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-gray-700">vs</td>
              <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                {schedule.team2.teamname}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
