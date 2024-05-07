import { supabase } from "@/lib/supabase";
import { PlayerProps, ScheduleProps } from "@/lib/types";

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

