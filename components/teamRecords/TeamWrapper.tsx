import React, { useContext, useEffect, useState } from "react";
import TeamForm from "./TeamForm";
import { RecordData, ScheduleData, TeamData } from "@/lib/types";
import RecordTable from "./RecordTable";
import { supabase } from "@/lib/supabase";
import { TeamRecordContext } from "@/context/TeamRecordContext";

export default function TeamWrapper() {
  const [recordData, setRecordData] = useState<RecordData[] | null>(null);

  const teamCtx = useContext(TeamRecordContext);

  const findSchedulesForTeam = async (teamId: number) => {
    const { data, error } = await supabase
      .from("schedule")
      .select(
        `*, scheduleid, matchdate, team1: team1(teamname), team2: team2(teamname), divisionid: division("divisionname")`
      )
      .or(`team1.eq.${teamId},team2.eq.${teamId}`)
      .order("matchdate", { ascending: false })
      .order("divisionid");

    if (data?.length) {
      console.log("schedule for a team:\n", data);

      const mappedData: RecordData[] = data.map((schedule) => {
        let teamname: string | null | undefined = teamCtx.teamRecord?.teamname;
        let opponent: string | undefined;
        let won: string | number | undefined;
        //@ts-ignore
        if (schedule.team1.teamname === teamCtx.teamRecord?.teamname) {
          //@ts-ignore
          opponent = schedule.team2.teamname!;
          won = schedule.team1wins === null ? "No Data" : schedule.team1wins;
          //@ts-ignore
        } else if (schedule.team2.teamname === teamCtx.teamRecord?.teamname) {
          //@ts-ignore
          opponent = schedule.team1.teamname!;
          won = schedule.team2wins === null ? "No Data" : schedule.team2wins;
        }

        return {
          teamname,
          opponent,
          won,
          date: schedule.matchdate ? schedule.matchdate : "No Data",
          //@ts-ignore
          division: schedule.divisionid.divisionname,
        };
      });

      console.log("mappedData:\n", mappedData);
      setRecordData(mappedData);
    } else if (data?.length === 0) {
      console.log("no schedule for a team:\n", data);
    } else {
      console.error(error);
    }
  };

  useEffect(() => {
    console.log(teamCtx);
    if (teamCtx.teamRecord?.teamid) {
      findSchedulesForTeam(teamCtx.teamRecord.teamid);
    }
  }, [teamCtx]);

  return (
    <div>
      <TeamForm />

      <RecordTable recordData={recordData} />
    </div>
  );
}
