import { RecordData } from "@/lib/types";
import { Ring } from "@uiball/loaders";

export default function RecordTable({
  recordData,
}: {
  recordData: RecordData[] | null | undefined;
}) {
  if (recordData === null || recordData === undefined) {
    return (
      <div className="mx-auto flex max-w-screen-xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <Ring />
      </div>
    );
  }

  const textColor = (divisionName: string) => {
    if (divisionName === "Red" || divisionName === "red") {
      return "text-red-600";
    } else if (divisionName === "Green" || divisionName === "green") {
      return "text-green-600";
    } else if (divisionName === "Blue" || divisionName === "blue") {
      return "text-blue-600";
    } else {
      return "text-gray-700";
    }
  };

  if (recordData.length === 0) {
    return (
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg">
          <h1 className="text-center text-2xl font-bold text-indigo-600 sm:text-3xl">
            No Records available!
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg">
      <h1 className="py-6 text-center text-2xl font-semibold text-indigo-600">
        {recordData && recordData[0]?.teamname} opponents:
      </h1>
      <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
        <thead className="text-center">
          <tr>
            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Team Name
            </th>

            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Division
            </th>

            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Won
            </th>

            <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
              Lost
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

              <td
                className={`whitespace-nowrap px-4 py-2 font-medium ${textColor(
                  record.division!
                )}
                `}
              >
                {record.division}
              </td>

              <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                {record.won}
              </td>

              <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                {3 - Number(record.won)}
              </td>

              <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                {new Date(record.date).toLocaleDateString("en-US", {
                  timeZone: "GMT",
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
