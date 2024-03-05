import { createContext, useContext } from "react";


export type LeagueProp =
  | {
      matchDate?:    string | 'none';
      day?:          string | 'TestDay' ;
      leagueid?:     number | 0 ;
      year?:         number | 2024 ;
      divisionName?: string | 'brown' | 'unknown' ;
      divisionId?:   number | 0 ;
    }
 ;


// Create a context for the current league
export const LeagueContext = createContext<{
  league: LeagueProp;
  onUpdate: (value: LeagueProp) => void;
}>

({
  league: {
    matchDate: 'none',
    day: 'TestDay',
    leagueid: 0,
    year: 2024,
    divisionName: 'brown',
    divisionId: 0,
  },
  onUpdate: (value) => {},
});

