import { supabase } from "@/lib/supabase";
import { PlayerProps, ScheduleProps, TeamProps } from "@/lib/types";

export async function deleteFromSupabase(scheduledMatch: ScheduleProps)  {
  try {
    const { data, error } = await supabase
      .from("schedule")
      .delete()
      .eq("scheduleid", scheduledMatch.scheduleid) ;
      if(error) {
        throw error ; 
      }
      } 
    catch (error: any) {
      console.log("Failed to delete match") ;
    }
}

export async function deletePlayerFromSupabase(player: PlayerProps)  {
  try {
    const { data, error } = await supabase
      .from("player")
      .delete()
      .eq("playerid", player.playerid) ;
      if(error) {
        throw error ; 
      }
      } 
    catch (error: any) {
      console.log("Failed to delete match") ;
    }
}

export async function deleteTeamOutFromSupabase(team: TeamProps, date: string)  {
  try {
    const { data, error } = await supabase
      .from("team_out")
      .delete()
      .eq("teamid", team.teamid)
      .eq("date_out", date) ;
      if(error) {
        throw error ; 
      }
      } 
    catch (error: any) {
      console.log("Failed to delete match" + error.message) ;
    }
}

