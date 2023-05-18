import React from "react";
import standings from "../../pages/standings";

type StandingProp = {
  teamname: string;
  total: number;
};

export default function StandingsTable({
  standings,    
}: {
  standings: StandingProp[] | null;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border">
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
