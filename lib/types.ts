import { Database } from "./database.types";
import { ChangeEvent } from "react" ;

export type ScheduleFormData = {
  day: string;
  date: string;
  division: string;
  year: string;
};

export type ScheduleData = {
  divisionid: {
    divisionname: string | null;
  };
  leagueid: number | null;
  matchdate: string | null;
  scheduleid: number;
  team1: {
    teamname: string | null;
    teamid: number | null;
  } | null;
  team1wins: number | null;
  team2: {
    teamname: string | null;
    teamid: number | null;
  } | null;
  team2wins: number | null;
} | null;

export type ScheduleFormProps = ScheduleFormData & {
  updateFields: (fields: Partial<ScheduleFormData>) => void;
  handleScheduleSearch: (e: React.FormEvent) => void;
};

export type StandingProp = {
  teamname: string;
  total: number;
};

export type TeamData = Database["public"]["Tables"]["team"]["Row"];

export type RecordData = {
  teamname: string | null | undefined;
  opponent: string | undefined;
  teamWins: number;
  opponentWins: number;
  isPlayed: boolean;
  date: string;
  division: any;
};


export type DivisionProps = {
        divisionid: number ;
        leagueid: number ; 
        divisionname: string;
        divisionvalue: number ; 
      }

export const emptyDivision: DivisionProps = {
  divisionid: -1,
  leagueid: -1,
  divisionname: 'brown',
  divisionvalue: -1,
} ;

export type TeamProps = {
  teamid: number ; 
  teamname: string ; 
  maleid: number ; 
  femaleid: number ; 
  leagueid: number ; 
  divisionid: number ; 
}

export type ExtraTeamProps = TeamProps & {
  newdivisionid: number ; // Needed at least temporarily during change of divisions. 
  wins: number ; // Might eventually be used by standings but definitely used by setDivisions
  losses: number ; // Might eventually be used by standings but definitely used by setDivisions
  isSaved: boolean ; // Flag for coloring the screen 
}

export const emptyTeam: TeamProps = {
  teamid: -1 ,
  teamname: "no team" ,
  maleid: -1,
  femaleid: -1, 
  leagueid: -1,
  divisionid: -1
}

export const extraEmptyTeam = (base:TeamProps):ExtraTeamProps => ({
  ...base,
  newdivisionid : base.divisionid ,
  wins: 0 ,
  losses: 0,
  isSaved: false
}) ;

export function convertToExtraTeam(team: TeamProps): ExtraTeamProps {
  return {
    ...team, 
    newdivisionid: team.divisionid, 
    wins: 0,
    losses: 0,
    isSaved: false
  };
}

export type ScheduleProps = {
  scheduleid: number ; 
  matchdate: string ; 
  team1: number ; 
  team2: number ; 
  leagueid: number ; 
  divisionid: number ; 
  team1wins: number ; 
  team2wins: number ; 
}

export type PlayerProps = {
  playerid: number ; 
  firstname: string ;
  lastname: string ; 
  gender: string ; 
  email: string ; 
  phone: string ;
  elo: number ; 
  entrydate: string ; 
}

export type SchedulingSetupProps =   {
  divisionHandler: (e: ChangeEvent<HTMLSelectElement>) => void;
  divisionid: number;
  allDivisions: DivisionProps[] ; 
  dateHandler:  (e: ChangeEvent<HTMLSelectElement>) => void;
  selectedDate: string ;
  dateList: string[] ; 
}


export type LeagueProps =   {
  leagueid: number;
  year: number ;
  day: string ; 
}