import { LeagueContext } from "@/context/LeagueContext";
import { TeamRecordContext, TeamRecordProp } from "@/context/TeamRecordContext";
import { supabase } from "@/lib/supabase";
import { TeamData } from "@/lib/types";
import { DotSpinner, Jelly } from "@uiball/loaders";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { BarLoader } from "react-spinners";

export default function TeamForm() {
  const [teamData, setTeamData] = useState<TeamData[] | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number>();
  const [loading, setLoading] = useState(false);

  const teamCtx = useContext(TeamRecordContext);
  const leagueCtx = useContext(LeagueContext);

  const [day, setDay] = useState(leagueCtx.league?.day);
  const [year, setYear] = useState(leagueCtx.league?.year);

  const getTeams = async () => {
    setLoading(true);
    let { data: team, error } = await supabase
      .from("team")
      .select("*")
      .eq("leagueid", leagueCtx.league?.leagueid)
      .order("teamname");

    if (error) {
      setLoading(false);
      toast.error("Error getting teams");
    }

    setTeamData(team);
    setLoading(false);
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
        day: league[0].day !== null ? league[0].day : "Monday",
        leagueid: league[0].leagueid,
        year: league[0].year != null ? league[0].year: 2024,
        matchDate: "",
      });
    } else {
      toast.error("No league found! Please try again", { id: notification });
    }
  };

  useEffect(() => {
    getTeams();
  }, [leagueCtx.league?.leagueid]);

  useEffect(() => {
    if (teamData && teamData.length > 0) {
      teamCtx.onUpdate({
        teamid: teamData[0].teamid,
        teamname: teamData[0].teamname,
      });
    }
  }, [teamData]);

  useEffect(() => {
    handleLeagueSearch();
  }, [day, year]);

  return (
    <div className="mx-auto max-w-screen-sm px-4 py-24">
      <div className="mx-auto">
        <form
          action=""
          className="mb-0 mt-6 space-y-4 rounded-lg bg-white p-4 shadow-lg sm:p-6 lg:p-8"
        >
          <div className="flex flex-col items-center justify-between sm:flex-row">
            <div className="w-full flex-col space-y-2 p-2">
              <label htmlFor="teamName" className="text-sm font-semibold">
                Select a Team
              </label>

              {loading && <BarLoader />}

              {teamData && (
                <div className="relative">
                  <select
                    className="w-full rounded-lg border-gray-200 bg-gray-100 p-2 text-xs shadow-sm sm:px-6 sm:py-4 sm:text-sm"
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

            <div className="w-full flex-col space-y-2 p-2">
              <label htmlFor="Day" className="text-sm font-semibold">
                Day
              </label>

              <div className="relative">
                <select
                  className="w-full rounded-lg border-gray-200 bg-gray-100 p-2 text-xs shadow-sm sm:px-6 sm:py-4 sm:text-sm"
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

            <div className="w-full flex-col space-y-2 p-2">
              <label htmlFor="Year" className="text-sm font-semibold">
                Year
              </label>

              <div className="relative">
                <select
                  className="w-full rounded-lg border-gray-200 bg-gray-100 p-2 text-xs shadow-sm sm:px-6 sm:py-4 sm:text-sm"
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
    </div>
  );
}
