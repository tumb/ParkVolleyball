import { Database } from "./database.types";

export type ScheduleFormData = {
  day: string;
  date: string;
  division: string;
  year: string;
};

export type ScheduleData = {
  scheduleid: number | null;
  matchdate: string;
  team1: { teamname: string | null };
  team2: { teamname: string | null };
  team1wins: number | null;
  team2wins: number | null;

  divisionid: { divisionname: string | null };
  leagueid: number | null;
};

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
  teamname: string;
  opponent: string;
  division: string;
  date: string;
  won: number;
}