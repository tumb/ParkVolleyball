import { DivisionProps, TeamProps, ScheduleProps, ExtraTeamProps, PlayerProps } from "@/lib/types";



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

export function computeListOfDates(dayOfWeek : string, weeksBeforeCount : number, weeksAfterCount : number) : string[] {
  let listOfDates : string[] = [] ; 
  const currentDate = new Date(); // apparenty a number of time since ??? in milliseconds
  const milliSecondsInADay = 24 * 60 * 60 * 1000 ; 
  const milliSecondsInAWeek = 7 * milliSecondsInADay ; 
  currentDate.setHours(0,0, 0, 0) ; 
  // Get the current day of the week (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
  const currentDay = currentDate.getDay();
  // Get the day of the week as an integer (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
  let targetDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(dayOfWeek.toLowerCase());
  if(targetDay == -1) {
    targetDay = 3 ; // Using wednesday for testday or a missing day.
  }
  // Calculate the number of days until the next occurrence of the target day
  let daysUntilNext = targetDay - currentDay;
  const startingDate = new Date(currentDate.getTime() + daysUntilNext * milliSecondsInADay) ; 
  listOfDates.push(startingDate.toISOString().split('T')[0]) ; 

  // Add in the previous dates
  for(let i = 1 ; i <= weeksBeforeCount ; i++) {
    let previousWeek = new Date(startingDate.getTime() - (i * milliSecondsInAWeek)) ; 
    let formattedDate = previousWeek.toISOString().split('T')[0];
    listOfDates.push(formattedDate)
  }

  // Add in the future dates
  for(let i = 1 ;  i <= weeksAfterCount ; i++) {
    let futureWeek = new Date(startingDate.getTime() + (i * milliSecondsInAWeek)) ; 
    let formattedDate = futureWeek.toISOString().split('T')[0];
    listOfDates.push(formattedDate)
  }

  return listOfDates ;
}

export function getCurrentFormattedDate()  {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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
  
  export function findSelectedPlayer(playerId: number, players:PlayerProps[]): PlayerProps | undefined {
    //   console.log("findSelectedTeam() teamId: ", teamId) ;
      const selected = players.find((player: PlayerProps) => player.playerid === playerId);
    //   console.log("returning team: ", selected?.teamid) ; 
      return selected;
    };

    export const findSelectedExtraTeam = (teamId: number, teams:ExtraTeamProps[]): ExtraTeamProps | undefined => {
    //   console.log("findSelectedTeam() teamId: ", teamId) ;
      const selected = teams.find((team: ExtraTeamProps) => team.teamid === teamId);
    //   console.log("returning team: ", selected?.teamid) ; 
      return selected;
    };
      

export function isValidDate(dateString: string) {
  // Regular expression for "yyyy-mm-dd" format
  const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

  // Test if the string matches the regular expression
  return dateFormat.test(dateString);
}


