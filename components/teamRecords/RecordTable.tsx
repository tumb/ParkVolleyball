import { RecordData, TeamData } from "@/lib/types";
import React from "react";

export default function RecordTable({
  recordData,
}: {
  recordData: RecordData[] | null;
}) {
  if (recordData === null) {
    return (
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg">
          <h1 className="text-center text-2xl font-bold text-indigo-600 sm:text-3xl">
            No teamData available!
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <h1 className="py-6 text-center text-2xl font-semibold text-indigo-600">
        {recordData[0]?.teamname} opponents:
      </h1>
      <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
        <thead className="text-center">
          <tr>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Team Name
            </th>

            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Won ?
            </th>

            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Date Played
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 text-center">
          {recordData?.map((record: RecordData, index: number) => (
            <tr className="odd:bg-gray-50" key={index}>
              <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                {record.opponent}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                {record.won}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                {record.date}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
