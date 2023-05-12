import { ScheduleProps } from "@/pages/schedule";
import React from "react";

const textColor = (schedule: ScheduleProps) => {
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
  schedules: ScheduleProps[];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border ">
      <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
        <thead className="text-center">
          <tr>
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
          {schedules?.map((schedule: ScheduleProps) => (
            <tr className="odd:bg-gray-50 hover:shadow" key={schedule.scheduleid}>
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
