import { LeagueContext } from "@/context/LeagueContext";
import { ScheduleData } from "@/lib/types";
import React, { useContext } from "react";

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
  const leagueCtx = useContext(LeagueContext);

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
      <h1 className="py-6 text-center text-2xl font-semibold text-indigo-600">
        Schedules
      </h1>
      {leagueCtx.league?.matchDate ? (
        <h2 className="pb-6 text-center text-lg font-semibold text-indigo-600">
          Showing schedules for:{" "}
          {new Date(leagueCtx.league.matchDate).toDateString()}
        </h2>
      ) : (
        <h2 className="pb-6 text-center text-lg font-semibold text-indigo-600">
          Showing all schedules available
        </h2>
      )}

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
            <th className="whitespace-nowrap py-2 font-medium text-gray-900">
              Team 1 wins
            </th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              VS
            </th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Team2
            </th>
            <th className="whitespace-nowrap py-2 font-medium text-gray-900">
              Team 2 wins
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
                {new Date(schedule.matchdate).toLocaleDateString("en-US", {
                  timeZone: "GMT",
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
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
              <td className="whitespace-nowrap py-2 text-gray-700">
                {schedule.team1wins}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-gray-700">vs</td>
              <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                {schedule.team2.teamname}
              </td>
              <td className="whitespace-nowrap py-2 text-gray-700">
                {schedule.team2wins}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}