import TeamWrapper from "@/components/teamRecords/TeamWrapper";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

export default function TeamPage() {
  const router = useRouter();
  const { team } = router.query as { team: string };
  const [teamId, setTeamId] = useState<number | null>(null);
  console.log("👉️ ~ file: [...team].tsx:10 ~ TeamPage ~ teamId:\n", teamId);

  async function getTeamData(teamName: string) {
    const { data, error } = await supabase
      .from("schedule")
      .select(
        `*, scheduleid, matchdate, team1: team1(teamname), team2: team2(teamname), divisionid: division("divisionname")`
      );
  }

  async function getTeamId(teamName: string) {
    let { data: team, error } = await supabase
      .from("team")
      .select("*")
      .eq("teamname", teamName);

    if (error) {
      console.log("error getting team id", error);
    }

    if (team?.length) {
      setTeamId(team[0].teamid);
    }
    console.log("👉️ ~ file: [...team].tsx:24 ~ getTeamId ~ team:\n", team);
  }

  useEffect(() => {
    if (team) {
      getTeamId(team);
    }
  }, []);

  return (
    <div>
      <h1>Team Page for {team}</h1>
      {/* Render the team's information here */}
    </div>
  );
}
