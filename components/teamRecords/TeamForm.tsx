import { supabase } from "@/lib/supabase";
import { TeamData } from "@/lib/types";
import React, { useEffect, useState } from "react";

type TeamFormProps = {
  teamData: TeamData[] | null;
  setTeamData: React.Dispatch<React.SetStateAction<TeamData[] | null>>;
  setSelectedTeamId: React.Dispatch<React.SetStateAction<number | null>>;
  selectedTeamId: number | null;
  setSelectedTeamName: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function TeamForm({
  teamData,
  setTeamData,
  setSelectedTeamId,
  selectedTeamId,
  setSelectedTeamName,
}: TeamFormProps) {
  const getTeams = async () => {
    let { data: team, error } = await supabase.from("team").select("*");

    if (error) {
      console.log("🚀 ~ file: TeamForm.tsx:7 ~ getTeams ~ error:\n", error);
    }
    setTeamData(team);
    console.log("🚀 ~ file: TeamForm.tsx:7 ~ getTeams ~ team:\n", team);
  };

  useEffect(() => {
    getTeams();
  }, []);

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-24">
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
                    value={selectedTeamId || ""}
                    onChange={(e) => {
                      setSelectedTeamId(e.target.value as unknown as number);
                      
                    }}
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

            <div className="w-full flex-col">
              <label htmlFor="Day" className="">
                Day
              </label>

              <div className="relative">
                <select
                  className="border-gray-200bg-gray-100 w-full rounded-lg bg-gray-100 p-2 text-xs shadow-sm sm:px-6 sm:py-4 sm:text-sm"
                  placeholder="Enter Day"
                  //   value={day}
                  //   onChange={(e) => setDay(e.target.value)}
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
                  className="border-gray-200bg-gray-100 w-full rounded-lg bg-gray-100 p-2 text-xs shadow-sm sm:px-6 sm:py-4 sm:text-sm"
                  placeholder="Enter Year"
                  //   value={year}
                  //   onChange={(e) => setYear(parseInt(e.target.value))}
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
    </div>
  );
}
