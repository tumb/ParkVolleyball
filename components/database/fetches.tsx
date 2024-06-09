import { supabase } from "@/lib/supabase";
import { DivisionProps, TeamProps, ScheduleProps, TeamOutProps } from "@/lib/types";

export async function fetchAllYears () : Promise<number[]> {
  try {
    const { data: yearsData, error } = await supabase
      .from("league")
      .select("year")
      .order("year");

    if (error) {
      throw error;
    }

   if( !yearsData)  {
    return[] ; 
   }
   // Extract the years and remove duplicates
      // Filter out null values and extract the years
      const yearsSet = new Set<number>(
        yearsData
          .filter((item: { year: number | null }) => item.year !== null)
          .map((item: { year: number | null }) => item.year as number)
      );
   const years = Array.from(yearsSet).sort((a, b) => a - b); // Ensure the years are sorted
   return years ; 
  } catch (error: any) {
      console.error("Error fetching divisions:" + error.message);
    throw error ;
  }
};

export async function fetchDivisionsForLeague (leagueId: number) : Promise<DivisionProps[]> {
  console.log("--- Started findDivisionsForLeague league: ", leagueId) ;
  try {
    const { data: divisionsData, error } = await supabase
      .from("division")
      .select()
      .eq("leagueid", leagueId)
      .order("divisionvalue");

    if (error) {
      throw error;
    }

    const divisions: DivisionProps[] = divisionsData.map((division) => ({
      divisionid: division.divisionid,
      divisionname: division.divisionname || "", // Handle null values by providing a default string
      divisionvalue: division.divisionvalue || 0, // Handle null values by providing a default number
      leagueid: division.leagueid,
    }));

    console.log("---  findDivisionsForLeague found data:", divisionsData);
    return divisions ; // Ensure that divisionsData is an array
  } catch (error: any) {
      console.error("Error fetching divisions:" + error.message);
    throw error ;
  }
};


export async function findDatesForLeague(leagueId: number) : Promise<string[]> {
  let dates: string[] = [] ; 
  try {
    const { data: datesData, error } = await supabase
    .from("schedule")
    .select("matchdate")
    .eq("leagueid", leagueId)
    .order("matchdate", {ascending:false} ) ;
    if(datesData != null) {
    for(const date of datesData ){
      const uniqueDates = new Set(datesData.map((item) => item.matchdate != null ? item.matchdate : ""));
      dates = Array.from(uniqueDates);
      } 
    } 
    }
    catch (error: any) {
      console.error("Error fetching divisions:" + error);
      throw error ;
    }
    return dates ; 
}

export async function findOutTeamsForLeagueAndDate(leagueId: number, date: string) : Promise<number[]> {
  // console.log("--- Started findTeamsForLeague. leagueId:",  leagueId) ;
  try { 
    const {data: teamData, error} = await supabase
    .from("team_out")
    .select("teamid") 
    .eq("leagueid", leagueId).eq("date_out", date) ;
    if(error) {
      throw error ; 
    }
    const teamIds: number[] = teamData.map((team) => ( team.teamid)) ;
    // console.log("--- Ending findTeamsForLeague. teams.length:",  teams.length) ;
    return teamIds ; 
  } 
  catch (error: any) {
    console.log("error in findTeamsForLeague", error.message) ;
    throw error ; 
  }
}


export async function findTeamsForLeague(leagueId: number) : Promise<TeamProps[]> {
  // console.log("--- Started findTeamsForLeague. leagueId:",  leagueId) ;
  try { 
    const {data: teamData, error} = await supabase
    .from("team")
    .select() 
    .eq("leagueid", leagueId) ;
    if(error) {
      throw error ; 
    }
    const teams: TeamProps[] = teamData.map((team) => ({
      teamid: team.teamid,
      teamname: team.teamname || "",
      maleid: team.maleid, 
      femaleid: team.femaleid,
      leagueid: team.leagueid,
      divisionid: team.divisionid || 0, 
    })) ;
    // console.log("--- Ending findTeamsForLeague. teams.length:",  teams.length) ;
    return teams ; 
  } 
  catch (error: any) {
    console.log("error in findTeamsForLeague", error.message) ;
    throw error ; 
  }
}

export async function findMatchesForLeagueAndDate(leagueId: number, date: string) : Promise<ScheduleProps[]> {
  // console.log("--- Started findMatchesForLeagueAndDate. leagueId:",  leagueId) ;
  try { 
    const {data: scheduleData, error} = await supabase
    .from("schedule")
    .select() 
    .eq("leagueid", leagueId)
    .eq("matchdate", date) ;
    if(error) {
      throw error ; 
    }
    const matches: ScheduleProps[] = scheduleData.map((match) => ({
      scheduleid: match.scheduleid, 
      matchdate: match.matchdate || "",
      team1: match.team1 || -1,
      team2: match.team2 || -1, 
      leagueid: match.leagueid || -1 , 
      divisionid: match.divisionid || -1, 
      team1wins: match.team1wins || 0 , 
      team2wins: match.team2wins || 0, 
    })) ;
    // console.log("--- Ending findMatchesForLeagueAndDate. matches.length:",  matches.length) ;
    return matches ; 
  } 
  catch (error: any) {
    console.log("error in findMatchesForLeagueAndDate", error.message, " date: ", date) ;
    console.log("error.stack: ", error.stack) ; 
    throw error ; 
  }
}

export async function findMatchesForLeagueDateDivision(leagueId: number, date: string, divisionId: number) : Promise<ScheduleProps[]> {
  // console.log("--- Started findMatchesForLeagueAndDate. leagueId:",  leagueId) ;
  try { 
    const {data: scheduleData, error} = await supabase
    .from("schedule")
    .select() 
    .eq("leagueid", leagueId)
    .eq("matchdate", date) 
    .eq("divisionid", divisionId)
    .order("scheduleid", {ascending: true});
    if(error) {
      throw error ; 
    }
    const matches: ScheduleProps[] = scheduleData.map((match) => ({
      scheduleid: match.scheduleid, 
      matchdate: match.matchdate || "",
      team1: match.team1 || -1,
      team2: match.team2 || -1, 
      leagueid: leagueId , 
      divisionid: divisionId, 
      team1wins: match.team1wins || 0 , 
      team2wins: match.team2wins || 0, 
    })) ;
    // console.log("--- Ending findMatchesForLeagueAndDate. matches.length:",  matches.length) ;
    return matches ; 
  } 
  catch (error: any) {
    console.log("error in findMatchesForLeagueAndDate", error.message) ;
    throw error ; 
  }
}

export async function fetchMatchesForTeam(team: TeamProps) : Promise<ScheduleProps[]> {
  console.log("--- Started fetchMatchesForTeam. teamname:",  team.teamname) ;
  try { 
    const {data: scheduleData, error} = await supabase
    .from("schedule")
    .select() 
    .eq("leagueid", team.leagueid)
    .or(`team1.eq.${team.teamid},team2.eq.${team.teamid}`) 
    .order("matchdate", {ascending: false});
    if(error) {
      throw error ; 
    }
    const matches: ScheduleProps[] = scheduleData.map((match) => ({
      scheduleid: match.scheduleid, 
      matchdate: match.matchdate || "",
      team1: match.team1 || -1,
      team2: match.team2 || -1, 
      leagueid: team.leagueid || -1, 
      divisionid: match.divisionid || -1, 
      team1wins: match.team1wins || 0 , 
      team2wins: match.team2wins || 0, 
    })) ;
    console.log("--- Ending fetchMatchesForTeam. matches.length:",  matches.length) ;
    return matches ; 
  } 
  catch (error: any) {
    console.log("error in fetchMatchesForTeam", error.message) ;
    throw error ; 
  }
}