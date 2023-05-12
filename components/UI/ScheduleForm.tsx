import React from "react";

export default function ScheduleForm() {
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg">
        <h1 className="text-center text-2xl font-bold text-indigo-600 sm:text-3xl">
          Find your schedule
        </h1>

        <p className="mx-auto mt-4 max-w-md text-center text-gray-500">
         Find which teams are playing each other
          on a specific date.
        </p>

        <form
          action=""
          className="mb-0 mt-6 space-y-4 rounded-lg p-4 shadow-lg sm:p-6 lg:p-8"
        >
          <div>
            <label htmlFor="Day" className="">
              Day
            </label>

            <div className="relative">
              <input
                type="Day"
                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                placeholder="Enter Day"
              />
            </div>
          </div>

          <div>
            <label htmlFor="date" className="">
              Date
            </label>

            <div className="relative">
              <input
                type="date"
                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                placeholder="Enter Date"
              />
            </div>
          </div>
          <div>
            <label htmlFor="Division" className="">
              Division
            </label>

            <div className="relative">
              <input
                type="text"
                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                placeholder="Enter Division"
              />
            </div>
          </div>
          <div>
            <label htmlFor="Year" className="">
              Year
            </label>

            <div className="relative">
              <input
                type="text"
                className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                placeholder="Enter Year"
              />
            </div>
          </div>

          <button
            type="submit"
            className="block w-full rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white"
          >
            Search Schedules
          </button>
        </form>
      </div>
    </div>
  );
}
