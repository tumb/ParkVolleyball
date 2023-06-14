import { createContext } from "react";


export type LeagueProp =
  | {
      matchDate?: string;
      day?: string | null | undefined;
      leagueid?: number | undefined;
      year?: number | null | undefined;
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
