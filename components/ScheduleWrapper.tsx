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

  async function getScheduleWithMatchDate() {
    setLoading(true);
    if (leagueCtx.league?.leagueid === undefined) {
      return;
    }
    const { data: schedules, error } = await supabase
      .from("schedule")
      .select(
        `*, scheduleid, matchdate, leagueid, team1: team1(*), team2: team2(*), division: division("divisionid, divisionname")`
      )
      .eq("leagueid", leagueCtx.league?.leagueid)
      .eq("matchdate", leagueCtx.league.matchDate)
      .order("matchdate", { ascending: false }) 
      ;

    if (schedules && schedules?.length) {
      console.log("file: ScheduleWrapper.tsx: getScheduleWithMatchDate schedules:\n", schedules );
      setLoading(false);
      setSchedules(schedules as ScheduleData[]);
    } else if (schedules?.length === 0) {
      setLoading(false);
      setSchedules(null);
    } else {
      console.error(error);
    }
  }

  async function getAllSchedule() {
    setLoading(true);
    if (leagueCtx.league?.leagueid === undefined) {
      return;
    }
    const { data: schedules, error } = await supabase
      .from("schedule")
      .select(
        `*, scheduleid, matchdate, team1: team1(*), team2: team2(*), division: division!inner("divisionname")`
      )
      .eq("leagueid", leagueCtx.league?.leagueid)
      .order("matchdate");

    if (schedules && schedules?.length) {
      console.log("getAllSchedule: ", schedules) ;
      setLoading(false);
      //Set only the schedules with the first matchDate. I don't need the rest.

      const firstMatchDate = schedules[schedules.length-1].matchdate;
      const filteredSchedules = schedules.filter(
        (schedule) => schedule.matchdate === firstMatchDate
      );
      filteredSchedules.sort((a, b) => {
        if(a.division && b.division) {
          const divisionA = a.division as {divisionname: string | null} ; 
          const divisionB = b.division as {divisionname: string | null} ; 
          if (divisionA.divisionname && divisionB.divisionname) {
            return divisionA.divisionname.localeCompare(divisionB.divisionname);
          } else if (!divisionA.divisionname && divisionB.divisionname) {
            return -1; // Consider null as less than any string
          } else if (divisionA.divisionname && !divisionB.divisionname) {
            return 1; // Consider any string greater than null
          } else {
            return 0; // Both are null, consider them equal
          }
        } else {
          return 0; // Either a.division or b.division is null
        }
      });
      setSchedules(filteredSchedules as ScheduleData[]);
    } else if (schedules?.length === 0) {
      setLoading(false);
      setSchedules(null);
    } else {
      console.error(error);    }
  }

  useEffect(() => {
    leagueCtx.league?.matchDate ? getScheduleWithMatchDate() : getAllSchedule();
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
