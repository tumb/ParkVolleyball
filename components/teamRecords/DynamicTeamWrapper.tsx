import { supabase } from "@/lib/supabase";
import { RecordData } from "@/lib/types";
import React, { useEffect, useState } from "react";
import RecordTable from "./RecordTable";
import { LineWobble, Ring } from "@uiball/loaders";

export default function DynamicTeamWrapper({ routerTeamName, teamId }) {
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
        alert("Error getting team id");
      }

      const mappedData = data?.map((item) => {
        let opponent: string | undefined;
        let won: string | number | undefined;
        //@ts-ignore
        if (item.team1.teamname === routerTeamName) {
          //@ts-ignore
          opponent = item.team2.teamname!;
          won = item.team1wins === null ? "No Data" : item.team1wins;
          //@ts-ignore
        } else if (item.team2.teamname === routerTeamName) {
          //@ts-ignore
          opponent = item.team1.teamname!;
          won = item.team2wins === null ? "No Data" : item.team2wins;
        }

        return {
          teamname: routerTeamName,
          opponent,
          won,
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
      alert("Error getting team id");
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
      <h1 className="p-4 text-center text-3xl font-bold">
        Team Details
      </h1>
      {/* Render the team's information here */}
      {(recordData !== null || undefined) && (
        <RecordTable recordData={recordData} />
      )}
    </div>
  );
}
