import { ScheduleFormProps } from "@/lib/types";

export default function ScheduleForm({
  date,
  division,
  day,
  year,
  updateFields,
  handleScheduleSearch,
}: ScheduleFormProps) {
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg">
        <h1 className="text-center text-2xl font-bold text-indigo-600 sm:text-3xl">
          Find Schedule
        </h1>

        <p className="mx-auto mt-4 max-w-md text-center text-gray-500">
          Find which teams are playing each other on a specific date.
        </p>

        <form
          action=""
          onSubmit={handleScheduleSearch}
          className="mb-0 mt-6 space-y-4 rounded-lg p-4 shadow-lg sm:p-6 lg:p-8"
        >
          <div>
            <label htmlFor="Day" className="">
              Day
            </label>

            <div className="relative">
              <select
                className="w-full  rounded-lg border-gray-200 bg-gray-100 p-4 pe-12 text-sm shadow-sm"
                placeholder="Enter Day"
                value={day}
                onChange={(e) => updateFields({ day: e.target.value })}
              >
                <option value="">Choose a League/Day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Sunday">Sunday</option>
                <option value="Saturday">Saturday</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="matchDate" className="">
              Match Date
            </label>

            <div className="relative">
              <input
                type="date"
                className="w-full rounded-lg border-gray-200 bg-gray-100 p-4 pe-12 text-sm shadow-sm"
                placeholder="Enter matchDate"
                value={date}
                onChange={(e) => updateFields({ date: e.target.value })}
              />
            </div>
          </div>
          {/* <div>
            <label htmlFor="Division" className="">
              Division
            </label>

            <div className="relative">
              <select
                className="w-full rounded-lg border-gray-200 bg-gray-100 p-4 pe-12 text-sm shadow-sm"
                placeholder="Enter Year"
                value={division}
                onChange={(e) => updateFields({ division: e.target.value })}
              >
                <option value="">Choose a Division</option>
                <option value="2021">Blue</option>
                <option value="2022">Green</option>
                <option value="2023">Red</option>
              </select>
            </div>
          </div> */}
          <div>
            <label htmlFor="Year" className="">
              Year
            </label>

            <div className="relative">
              <select
                className="w-full rounded-lg border-gray-200 bg-gray-100 p-4 pe-12 text-sm shadow-sm"
                placeholder="Enter Year"
                value={year}
                onChange={(e) => updateFields({ year: e.target.value })}
              >
                <option value="">Choose a Year</option>
                <option value="2021">2021</option>
                <option value="2022">2022</option>
                <option value="2023">2023</option>
              </select>
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
