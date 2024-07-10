import { StandingProp } from "@/pages/standings";
import { useContext, useEffect, useState } from "react";
import StandingsTable from "./UI/StandingsTable";
import TeamStandingsTable from "./UI/TeamStandingsTable";
import { supabase } from "@/lib/supabase";
import { Waveform } from "@uiball/loaders";
import { LeagueContext } from "@/context/LeagueContext";
import { findMatchesForLeague, fetchDivisionsForLeague, findTeamsForLeague } from "@/components/database/fetches" ;
import { DivisionProps, TeamProps, ScheduleProps, TeamStandingsProps } from "@/lib/types";

export default function StandingsWrapper() {
  const [standings, setStandings] = useState<StandingProp[] | null>([]);
  const [loading, setLoading] = useState(false);
  const leagueCtx = useContext(LeagueContext);
  const [allMatches, setAllMatches] = useState<ScheduleProps[]> ([]);
  const [divisions, setDivisions] = useState<DivisionProps[]> ([]);
  const [teams, setTeams] = useState<TeamProps[]> ([]);
  const [allTeamStandings, setAllTeamStandings] = useState<TeamStandingsProps[] | null>([]);

  function addDataToTeam(teamStandings: TeamStandingsProps, wins: number, division: DivisionProps) {
    teamStandings.totalPoints += wins * division.divisionvalue;
    if (division?.divisionname.toLowerCase() == 'red') {
      teamStandings.redWins += wins;
    }
    else if (division?.divisionname.toLowerCase() == 'green') {
      teamStandings.greenWins += wins;
    }
    else if (division?.divisionname.toLowerCase() == 'blue') {
      teamStandings.blueWins += wins;
    }
  }

  function computeStandings() {
    let allTeamStandings : TeamStandingsProps[] = [] ;  
    for (const team of teams) {
      let teamStandings : TeamStandingsProps = {teamId : team.teamid, teamName : team.teamname, redWins : 0 , greenWins : 0, blueWins : 0, totalPoints : 0}
      for (const match of allMatches) {
        if(match.team1 == team.teamid) {
          let division = divisions.find(division => match.divisionid == division.divisionid) ;
          let wins = match.team1wins ;
          if(division) {
            addDataToTeam(teamStandings, wins, division);
          }
        }
        else if(match.team2 == team.teamid) {
          let division = divisions.find(division => match.divisionid == division.divisionid) ;
          let wins = match.team2wins ;
          if(division) {
            addDataToTeam(teamStandings, wins, division);
          }
        }
      }
      allTeamStandings.push(teamStandings) ;
    }
    allTeamStandings.sort((a:TeamStandingsProps, b:TeamStandingsProps) => b.totalPoints - a.totalPoints) ;
    setAllTeamStandings(allTeamStandings) ; 
    console.log("allTeamStandings.length: ", allTeamStandings.length) ; 
    console.log("team 1", allTeamStandings[0].teamName, " ", allTeamStandings[0].totalPoints, " ", allTeamStandings[0].redWins, " ", allTeamStandings[0].greenWins, " ", allTeamStandings[0].blueWins)
  }

  function findDivisionValue(divisionId : number) {
    return divisions.find(division => divisionId == division.divisionid )?.divisionvalue
  }

  async function getStandingData() {
    setLoading(true);

    if (leagueCtx.league?.leagueid === undefined) {
      return;
    }

    const { data, error } = await supabase.rpc("calculate_standings", {
      leagueid: leagueCtx.league?.leagueid,
    });

    if (data?.length) {
      setLoading(false);

      setStandings(data);
    } else if (data?.length === 0) {
      setLoading(false);
      setStandings(null);
    } else {
      console.error(error);
    }
  }

  useEffect(() => {
    getStandingData();
  }, [leagueCtx]);

	useEffect(() => {
		async function fetchMatches() {
			let newMatches : ScheduleProps[] = [] ;
				if(leagueCtx.league.leagueid != undefined) {
					newMatches  = await findMatchesForLeague(leagueCtx.league.leagueid) ; 
					setAllMatches(newMatches) ;
			}
		}
		fetchMatches() ;
    async function fetchDivisions() {
			let newDivisions : DivisionProps[] = [] ;
				if(leagueCtx.league.leagueid != undefined) {
					newDivisions = await fetchDivisionsForLeague(leagueCtx.league.leagueid) ; 
					setDivisions(newDivisions) ;
			}
    }
    fetchDivisions() ; 
    async function fetchTeams() {
			let newTeams : TeamProps[] = [] ;
				if(leagueCtx.league.leagueid != undefined) {
					newTeams = await findTeamsForLeague(leagueCtx.league.leagueid) ; 
					setTeams(newTeams) ;
			}
    }
    fetchTeams() ; 
	}, [leagueCtx]) ;


  useEffect(() => {
    if(allMatches.length > 0 && divisions.length > 0 && teams.length > 0) {
      computeStandings() ; 
    }
  }, [allMatches, divisions, teams]) ; 

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
              <TeamStandingsTable teamStandings={allTeamStandings} />
            </>
          )}
        </>
      )}
    </div>
  );
}
