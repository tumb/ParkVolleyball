import { supabase } from "@/lib/supabase";
import { RecordData } from "@/lib/types";
import React, { useEffect, useState } from "react";
import RecordTable from "./RecordTable";
import { LineWobble, Ring } from "@uiball/loaders";

export default function DynamicTeamWrapper({
  routerTeamName,
  teamId,
}: {
  routerTeamName: string;
  teamId: number;
}) {
  const [recordData, setRecordData] = useState<RecordData[] | null | undefined>(
    null
  );
  async function getTeamData() {
    try {
      const { data, error } = await supabase
        .from("schedule")
        .select(
          `*, scheduleid, matchdate, team1: team1(teamname), team2: team2(teamname), divisionid: division("divisionname")`
        )
        .or(`team1.eq.${teamId},team2.eq.${teamId}`)
        .order("matchdate", { ascending: false })
        .order("divisionid");

      if (error) {
        console.log("error getting team id", error);
        alert("Something went wrong. Please reload the page");
      }

      const mappedData: RecordData[] | undefined = data?.map((item) => {
        let opponent: string | undefined;
        let teamWins: number = 0;
        let opponentWins: number = 0;
        let isPlayed: boolean;
        //@ts-ignore
        if (item.team1.teamname === routerTeamName) {
          //@ts-ignore
          opponent = item.team2.teamname!;
          teamWins = item.team1wins!;
          opponentWins = item.team2wins!; //@ts-ignore
        } else if (item.team2.teamname === routerTeamName) {
          //@ts-ignore
          opponent = item.team1.teamname!;
          teamWins = item.team2wins!;
          opponentWins = item.team1wins!;
        }

        isPlayed = item.team1wins === 0 && item.team2wins === 0 ? false : true;

        return {
          teamname: routerTeamName,
          opponent,
          teamWins,
          opponentWins,
          isPlayed,
          date: item.matchdate ? item.matchdate : "No Data",
          //@ts-ignore
          division: item.divisionid.divisionname,
        };
      });

      console.log(
        "👉️ ~ file: [...team].tsx:55 ~ mappedData ~ mappedData:\n",
        mappedData
      );

      setRecordData(mappedData);
    } catch (error) {
      console.log("error getting team id", error);
      alert("Something went wrong. Please reload the page");
    }
  }

  useEffect(() => {
    getTeamData();
  }, []);

  if (recordData === null || recordData === undefined) {
    return (
      <div className="mx-auto flex max-w-screen-xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <LineWobble />
      </div>
    );
  }
  return (
    <div>
      <h1 className="p-4 text-center text-3xl font-bold">Team Details</h1>
      {/* Render the team's information here */}
      {(recordData !== null || undefined) && (
        <RecordTable recordData={recordData} />
      )}
    </div>
  );
}
