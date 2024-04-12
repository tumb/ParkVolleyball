import { supabase } from "@/lib/supabase";
import { ScheduleProps } from "@/lib/types";

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

