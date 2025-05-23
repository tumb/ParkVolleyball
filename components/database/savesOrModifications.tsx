import { supabase } from "@/lib/supabase";
import { TeamProps, ScheduleProps, ExtraTeamProps, PlayerProps } from "@/lib/types";
import { getCurrentFormattedDate } from "@/components/admin/scheduling_functions/SchedulingUI";


export async function saveToSupabase(schedule: ScheduleProps) {
  console.log("--- saveToSupabase started. ", schedule.scheduleid) ;
  var tempId = schedule.scheduleid ; 
  if(tempId > 1) {
    try {
      const { data, error } = await supabase
        .from("schedule")
        .insert([schedule]);
  
      if (error) {
        throw error;
      }
  
      console.log("Schedule saved successfully with current id:", data);
    } catch (error: any) {
      console.error("Error saving schedule:", error.message);
    }
  }
  else {
    try {
      // Omit the scheduleid property from the schedule object
      const { scheduleid, ...scheduleWithoutId } = schedule;
      const { data, error } = await supabase
        .from("schedule")
        .insert([scheduleWithoutId]);
      if(data !== null) {
        tempId = (data as ScheduleProps[])[0]?.scheduleid ;
        console.log("tempId: ", tempId) ;
      }
      else {
        console.log("data returned is null.") ;
      }
      if (error) {
        throw error;
      }
      console.log("Schedule saved successfully with new scheduleid: ", tempId);
    } catch (error: any) {
      console.error("Error saving schedule:", error.message);
    }
  }
}

export async function saveOutTeamsToDatabase(newTeams: TeamProps[], date: string): Promise<void>  {
  let tempId = 0 ;
  for(const team of newTeams) {
  try {
    // Omit the teamid property from the team object
    const { data, error } = await supabase
      .from("team_out")
      .insert({"teamid" : team.teamid, "date_out" : date, "leagueid" : team.leagueid});
    if (error) {
      throw error;
    }
      console.log("Teamout saved successfully with new team_out_id: ", tempId);
    } catch (error: any) {
      console.error("Error saving schedule:", error.message);
    }
  }
}

export async function saveTeamsToDatabase(newTeams: TeamProps[]): Promise<void>  {
  let tempId = 0 ;
  for(const team of newTeams) {
  try {
    // Omit the teamid property from the team object
    const { teamid, ...teamWithoutId } = team;
    const { data, error } = await supabase
      .from("team")
      .insert([teamWithoutId]);
    if(data !== null) {
      tempId = (data as TeamProps[])[0]?.teamid ;
      console.log("tempId: ", tempId) ;
    }
    else {
      console.log("data returned is null.") ;
    }
    if (error) {
      throw error;
    }
      console.log("Team saved successfully with new teamId: ", tempId);
    } catch (error: any) {
      console.error("Error saving schedule:", error.message);
    }
  }
}

export async function submitResultsToDatabase(updatedMatches: ScheduleProps[]): Promise<string> {
  try {
    for(const match of updatedMatches) {
      const { data, error } = await supabase
        .from("schedule")
        .update({team1wins : match.team1wins > 0 ? match.team1wins : 0, team2wins : match.team2wins > 0 ? match.team2wins: 0}) 
        .eq("scheduleid", match.scheduleid)
    }
    return "Update succeeded." ; 
  }
  catch (error: any) {
    console.log(error.message) ; 
    return "Update failed. " + error.message ; 
  }
}

export async function updateDivisionForATeam(extraTeam: ExtraTeamProps) {
  try {
    const { data, error } = await supabase
      .from("team")
      .update({divisionid : extraTeam.newdivisionid}) 
      .eq("teamid", extraTeam.teamid)
  return "Update succeeded." ; 
}
catch (error: any) {
  console.log(error.message) ; 
  return "Update failed. " + error.message ; 
}

}

export async function updatePlayerInfo(playerInfo: PlayerProps) {
  let message = " for player: " + playerInfo.firstname + " " + playerInfo.lastname ; 
  const date = getCurrentFormattedDate() ; 
  try {
    const { data, error } = await supabase
      .from("player")
      .update({firstname : playerInfo.firstname, lastname: playerInfo.lastname, 
        phone: playerInfo.phone, email: playerInfo.email, 
        gender: playerInfo.gender, entrydate: date }) 
      .eq("playerid", playerInfo.playerid)
    if(error) {
      throw error ;
    }
    else {
      return "Update successful. " + message ;  
    }
}
catch (error: any) {
  console.log(error.message) ; 
  return "Update failed. " + message + " Error message: " + error.message ; 
}  
}

export async function updateTeamInfo(teamInfo: TeamProps) {
  let message = " for team: " + teamInfo.teamname ; 
  const date = getCurrentFormattedDate() ; 
  try {
    const {data, error } = await supabase.from("team")
      .update({teamname : teamInfo.teamname, divisionid : teamInfo.divisionid, })
      .eq("teamid", teamInfo.teamid) 
    if(error) {
      throw error ; 
    }
    else {
      return "Update successful " + message ; 
    }
  }
  catch (error: any) {
    console.log(error.message) ;
    return "Update failed " + message + ". Error message: " + error.message ; 
  }
}

export async function updateMatchDate(originalDate : string, newDate : string) {
  try {
      const { data, error } = await supabase
        .from("schedule")
        .update({matchdate : newDate}) 
        .eq("matchdate", originalDate)
    return "Update succeeded." ; 
  }
  catch (error: any) {
    console.log(error.message) ; 
    return "Update failed. " + error.message ; 
  }
}
