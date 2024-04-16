import { DivisionProps, TeamProps, ScheduleProps } from "@/lib/types";

export const findSelectedDivision = (divId: number, divisions:DivisionProps[]): DivisionProps | undefined => {
//   console.log("findSelectedDivision() divId: ", divId) ;
  const selected = divisions.find((division: DivisionProps) => division.divisionid === divId);
//   console.log("returning division: ", selected?.divisionid) ; 
  return selected;
};

export const findSelectedTeam = (teamId: number, teams:TeamProps[]): TeamProps | undefined => {
  //   console.log("findSelectedTeam() teamId: ", teamId) ;
    const selected = teams.find((team: TeamProps) => team.teamid === teamId);
  //   console.log("returning team: ", selected?.teamid) ; 
    return selected;
  };
  
  
export function isValidDate(dateString: string) {
  // Regular expression for "yyyy-mm-dd" format
  const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

  // Test if the string matches the regular expression
  return dateFormat.test(dateString);
}

export function createMatch(newScheduleid: number, scheduleDate: string, team1: TeamProps, team2: TeamProps, leagueid: number, divisionid: number, team1wins: number, team2wins: number ) : ScheduleProps | undefined {
  const scheduledMatch:ScheduleProps = {
    scheduleid: newScheduleid, 
    matchdate: scheduleDate, 
    team1: team1.teamid, 
    team2: team2.teamid,
    leagueid: leagueid, 
    divisionid: divisionid,
    team1wins: team1wins,
    team2wins: team2wins
  }
  // Check over match to make sure it's ok. 
  return scheduledMatch ; 
}

export function getCurrentFormattedDate()  {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}


