import React, { useContext } from "react";
import standings from "../../pages/standings";
import { LeagueContext } from "@/context/LeagueContext";
import { TeamStandingsProps } from "@/lib/types";

export default function TeamStandingsTable({  teamStandings}: {  teamStandings: TeamStandingsProps[] | null;}) 
  {
  const leagueCtx = useContext(LeagueContext);

  if (teamStandings === null) {
    return (
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg">
          <h1 className="text-center text-2xl font-bold text-indigo-600 sm:text-3xl">
            No standings available!
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <h1 className="py-12 text-center text-2xl font-semibold text-indigo-600">
        League: {leagueCtx.league?.day} {leagueCtx.league?.year}
      </h1>

      <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
        <thead className="text-center">
          <tr>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Team Name
            </th>

            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Total Points
            </th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-red-900">
              Red Wins
            </th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-green-900">
              Green Wins
            </th>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-blue-900">
              Blue Wins
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 text-center">
          {teamStandings?.map((teamStanding: TeamStandingsProps, index: number) => (
            <tr className="odd:bg-gray-50" key={index}>
              <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                {teamStanding.teamName}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                {teamStanding.totalPoints}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-red-700">
                {teamStanding.redWins}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-green-700">
                {teamStanding.greenWins}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-blue-700">
                {teamStanding.blueWins}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
