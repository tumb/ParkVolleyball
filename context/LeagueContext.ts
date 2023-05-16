import { createContext } from "react";
import { Database } from "../lib/database.types";

export type LeagueProp =
  | {
      day: string | null;
      leagueid: number;
      year: number | null;
    }
  | undefined;

// Create a context for the current league
export const LeagueContext = createContext<{
  league: LeagueProp;
  onUpdate: (value: LeagueProp) => void;
}>({
  league: undefined,
  onUpdate: (value) => {},
});
