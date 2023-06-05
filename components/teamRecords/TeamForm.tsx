import { TeamRecordContext, TeamRecordProp } from "@/context/TeamRecordContext";
import { supabase } from "@/lib/supabase";
import { TeamData } from "@/lib/types";
import React, { useContext, useEffect, useState } from "react";

export default function TeamForm() {
  const [teamData, setTeamData] = useState<TeamData[] | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number>();

  const teamCtx = useContext(TeamRecordContext);

  const getTeams = async () => {
    let { data: team, error } = await supabase.from("team").select("*");

    if (error) {
      console.log("🚀 ~ file: TeamForm.tsx:7 ~ getTeams ~ error:\n", error);
    }
    setTeamData(team);
    console.log("🚀 ~ file: TeamForm.tsx:7 ~ getTeams ~ team:\n", team);
  };

  const handleTeamChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTeamId(parseInt(event.target.value));
    const newTeamId = parseInt(event.target.value);
    const newTeamName = teamData?.find((team) => team.teamid === newTeamId);

    // Update the teamCtx to include the teamId value
    const updatedTeam: TeamRecordProp = {
      ...(teamCtx.teamRecord || {}),
      teamid: newTeamId,
      teamname: newTeamName?.teamname,
    };

    teamCtx.onUpdate(updatedTeam);
  };

  useEffect(() => {
    getTeams();
  }, []);

  return (
    <div className="mx-auto max-w-screen-sm px-4 py-24">
      <div className="mx-auto">
        <form
          action=""
          className="mb-0 mt-6 space-y-4 rounded-lg bg-white p-4 shadow-lg sm:p-6 lg:p-8"
        >
          <div className="flex flex-col items-center justify-between space-y-2 sm:flex-row sm:space-x-6">
            <div className="w-full flex-col">
              <label htmlFor="teamName" className="">
                Select a Team
              </label>

              {teamData && (
                <div className="relative">
                  <select
                    className="border-gray-200bg-gray-100 w-full rounded-lg bg-gray-100 p-2 text-xs shadow-sm sm:px-6 sm:py-4 sm:text-sm"
                    placeholder="Enter matchDate"
                    name="teamName"
                    value={selectedTeamId}
                    onChange={handleTeamChange}
                  >
                    {teamData?.map((team, index) => (
                      <option value={team.teamid} key={index}>
                        {team.teamname}
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
