import { LeagueContext } from "@/context/LeagueContext";
import { TeamRecordContext, TeamRecordProp } from "@/context/TeamRecordContext";
import { supabase } from "@/lib/supabase";
import { TeamData } from "@/lib/types";
import { DotSpinner, Jelly } from "@uiball/loaders";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { BarLoader } from "react-spinners";

export default function NavForm() {
  const [loading, setLoading] = useState(false);

  const teamCtx = useContext(TeamRecordContext);
  const leagueCtx = useContext(LeagueContext);

  const [day, setDay] = useState(leagueCtx.league?.day);
  const [year, setYear] = useState(leagueCtx.league?.year);

  const handleLeagueSearch = async () => {
    const notification = toast.loading("Searching for a league...");

    let { data: league, error } = await supabase
      .from("league")
      .select()
      .eq("day", day)
      .eq("year", year);
    console.log(
      "🚀 ~ file: LeagueForm.tsx:58 ~ LeagueForm ~ league:\n",
      league
    );

    if (league?.length) {
      toast.success("Found it 😊", { id: notification });

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
    handleLeagueSearch();
  }, [day, year]);

  return (
    <div className="mx-auto h-fit">
      <form action="" className="">
        <div className="flex flex-col items-center justify-between sm:flex-row">
          <div className="flex w-full items-center justify-between p-2">
            <label htmlFor="Day" className="px-2 text-sm font-semibold">
              Day
            </label>

            <div className="relative">
              <select
                className="min-w-full rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-sm sm:text-sm"
                placeholder="Enter Day"
                value={day!}
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

          <div className="flex w-full items-center justify-between p-2">
            <label htmlFor="Year" className="px-2 text-sm font-semibold">
              Year
            </label>

            <div className="relative">
              <select
                className="min-w-full rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-sm sm:text-sm"
                placeholder="Enter Year"
                value={year!}
                onChange={(e) => setYear(parseInt(e.target.value))}
              >
                <option value="2021">2021</option>
                <option value="2022">2022</option>
                <option value="2023">2023</option>
              </select>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
