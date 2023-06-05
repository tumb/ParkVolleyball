import React, { useContext, useEffect, useState } from "react";
import TeamForm from "./TeamForm";
import { RecordData, TeamData } from "@/lib/types";
import RecordTable from "./RecordTable";
import { supabase } from "@/lib/supabase";
import { TeamRecordContext } from "@/context/TeamRecordContext";

export default function TeamWrapper() {
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedTeamName, setSelectedTeamName] = useState<string | null>("");
  const [recordData, setRecordData] = useState<RecordData[] | null>(null);

  const teamCtx = useContext(TeamRecordContext);


  console.log(
    "🚀 ~ file: TeamWrapper.tsx:11 ~ TeamWrapper ~ selectedTeamName:\n",
    selectedTeamName
  );
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

      //Map the data to the RecordData type object. For all the entries, teamname should be the same from the teamId.
      // Then set the other teamname to the opponent. Calculte the wins and losses by comparing the teamId to the winner. 0 for loss, 2 for win, 1 for draw.
      // set the matchdate as the date.
    } else if (data?.length === 0) {
      console.log("no schedule for a team:\n", data);
    } else {
      console.error(error);
    }
  };

  useEffect(() => {
    if (selectedTeamId) {
      findSchedulesForTeam(selectedTeamId);
    }
  }, [selectedTeamId]);



  useEffect(() => {
    console.log(teamCtx)
  }, [teamCtx])
  
  return (
    <div>
      <TeamForm />

      <RecordTable recordData={recordData} />
    </div>
  );
}
