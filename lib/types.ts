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
  won: string | number | undefined;
  isPlayed: boolean;
  date: string;
  division: any;
};
