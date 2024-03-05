import { Database } from "./database.types";

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

export type TeamProps = {
  teamid: number ; 
  teamname: string ; 
  maleid: number ; 
  femaleid: number ; 
  leagueid: number ; 
  divisionid: number ; 
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

export type SchedulingSetupProps = {
  divisionHandler: (e: ChangeEvent<HTMLSelectElement>) => void;
  divisionid: number;
  dateHandler:  (e: ChangeEvent<HTMLInputElement>) => void;
  scheduleDate: string ; 
  allDivisions: DivisionProps[] ; 
}
