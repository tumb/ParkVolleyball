import React, { useContext } from "react";
import standings from "../../pages/standings";
import { LeagueContext } from "@/context/LeagueContext";
import { StandingProp } from "@/lib/types";

export default function StandingsTable({
  standings,
}: {
  standings: StandingProp[] | null;
}) {
  const leagueCtx = useContext(LeagueContext);

  if (standings === null) {
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
        League: {leagueCtx.league?.day}, {leagueCtx.league?.year}
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
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 text-center">
          {standings?.map((standing: StandingProp, index: number) => (
            <tr className="odd:bg-gray-50" key={index}>
              <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                {standing.teamname}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                {standing.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
