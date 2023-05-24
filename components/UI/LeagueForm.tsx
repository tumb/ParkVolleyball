import { LeagueContext, LeagueProp } from "@/context/LeagueContext";
import { supabase } from "@/lib/supabase";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function LeagueForm() {
  const [day, setDay] = useState("Monday");
  const [year, setYear] = useState(2023);
  const [matchDates, setMatchDates] = useState<{ [x: string]: any }[] | null>(
    null
  );
  const [selectedMatchDate, setSelectedMatchDate] = useState("");

  const leagueCtx = useContext(LeagueContext);

  const getMatchDates = async (leagueId: number) => {
    const { data, error } = await supabase
      .from("distinct_macthdate")
      .select("*")
      .eq("leagueid", leagueId);

    if (error) {
      console.log(
        "🚀 ~ file: LeagueForm.tsx:15 ~ getMatchDates ~ error:\n",
        error
      );
    }
    console.log("🚀 ~ file: LeagueForm.tsx:15 ~ getMatchDates ~ data:\n", data);

    setMatchDates(data);
  };

  const matchDateHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMatchDate(e.target.value);
    const newMatchDate = e.target.value;

    // Update the leagueCtx to include the matchDate value
    const updatedLeague: LeagueProp = {
      ...(leagueCtx.league || {}),
      matchDate: newMatchDate,
    };

    leagueCtx.onUpdate(updatedLeague);
  };

  const handleLeagueSearch = async (e) => {
    e.preventDefault();
    setYear(parseInt(e.target.value));
    const notification = toast.loading("Searching for a league...");

    let { data: league, error } = await supabase
      .from("league")
      .select()
      .eq("day", day)
      .eq("year", year);

    if (league?.length) {
      toast.success("Found it 😊", { id: notification });
      getMatchDates(league[0].leagueid);

      leagueCtx.onUpdate({
        day: league[0].day,
        leagueid: league[0].leagueid,
        year: league[0].year,
        matchDate: "",
      });
    } else {
      toast.error("No league found! Please try again", { id: notification });
    }
  };

  useEffect(() => {
    console.log("Updated leagueCtx:", leagueCtx.league?.matchDate);
  }, [leagueCtx.league]);

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto">
        {leagueCtx.league ? (
          <>
            <h1 className="text-center text-2xl font-bold text-indigo-600 sm:text-3xl">
              Your League Information:
            </h1>
            <p className="mx-auto mt-4 max-w-md text-center text-gray-500">
              League Id: {leagueCtx.league.leagueid}
            </p>
            <p className="mx-auto mt-4 max-w-md text-center text-gray-500">
              League Day: {leagueCtx.league.day}, {leagueCtx.league.year}
            </p>
            <p className="mx-auto mt-4 max-w-md text-center text-gray-500">
              Search Again?
            </p>
          </>
        ) : (
          <>
            <h1 className="text-center text-2xl font-bold text-indigo-600 sm:text-3xl">
              League Search
            </h1>
            <p className="mx-auto mt-4 max-w-md text-center text-gray-500">
              Find your league to get started
            </p>
          </>
        )}
        <form
          action=""
          onSubmit={handleLeagueSearch}
          className="mb-0 mt-6 space-y-4 rounded-lg p-4 shadow-lg sm:p-6 lg:p-8"
        >
          <div className="flex items-center justify-between space-x-6">
            <div className="w-full flex-col">
              <label htmlFor="Day" className="">
                Day
              </label>

              <div className="relative">
                <select
                  className="border-gray-200bg-gray-100 w-full rounded-lg bg-gray-100 px-6 py-4 pe-12 text-sm shadow-sm"
                  placeholder="Enter Day"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                >
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

            <div className="w-full flex-col">
              <label htmlFor="Year" className="">
                Year
              </label>

              <div className="relative">
                <select
                  className="w-full rounded-lg border-gray-200 bg-gray-100 p-4 pe-12 text-sm shadow-sm"
                  placeholder="Enter Year"
                  value={year}
                  onChange={handleLeagueSearch}
                >
                  <option value="2021">2021</option>
                  <option value="2022">2022</option>
                  <option value="2023">2023</option>
                </select>
              </div>
            </div>

            <div className="w-full flex-col">
              <label htmlFor="matchDate" className="">
                Available Matchdates
              </label>

              {matchDates && (
                <div className="relative">
                  <select
                    className="w-full rounded-lg border-gray-200 bg-gray-100 p-4 pe-12 text-sm shadow-sm"
                    placeholder="Enter matchDate"
                    value={selectedMatchDate}
                    onChange={matchDateHandler}
                  >
                    {matchDates.map((matchDate, index) => (
                      <option value={matchDate.matchdate} key={index}>
                        {new Date(matchDate?.matchdate).toDateString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
