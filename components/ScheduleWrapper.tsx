import { supabase } from "@/lib/supabase";
import { Waveform } from "@uiball/loaders";
import { useContext, useEffect, useState } from "react";
import { LeagueContext } from "../context/LeagueContext";
import ScheduleTable from "./UI/ScheduleTable";
import { ScheduleData } from "@/lib/types";

export default function ScheduleWrapper() {
  const [schedules, setSchedules] = useState<ScheduleData[] | null>();
  const [loading, setLoading] = useState(false);
  const leagueCtx = useContext(LeagueContext);

  async function getSchedule() {
    setLoading(true);
    if (leagueCtx.league?.leagueid === undefined) {
      return;
    }
    const { data: schedules, error } = await supabase
      .from("schedule")
      .select(
        `*, scheduleid, matchdate, team1: team1(teamname), team2: team2(teamname), divisionid: division("divisionname")`
      )
      .eq("leagueid", leagueCtx.league?.leagueid)
      .order("matchdate", { ascending: false });

    if (schedules?.length) {
      setLoading(false);
      setSchedules(schedules as ScheduleData[]);
    } else if (schedules?.length === 0) {
      setLoading(false);
      setSchedules(null);
    } else {
      console.error(error);
    }
  }

  useEffect(() => {
    getSchedule();
  }, [leagueCtx]);

  return (
    <div className="">
      {leagueCtx.league?.leagueid === undefined ? (
        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8 ">
          <div className="mx-auto max-w-lg">
            <h1 className="text-center text-2xl font-bold text-indigo-600 sm:text-3xl">
              Please select a league first!
            </h1>
          </div>
        </div>
      ) : (
        <>
          {loading ? (
            <div className="flex w-full items-center justify-center p-24">
              <Waveform size={40} lineWeight={3.5} speed={1} color="black" />
            </div>
          ) : (
            <>
              <ScheduleTable schedules={schedules} />
            </>
          )}
        </>
      )}
    </div>
  );
}
