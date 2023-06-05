//create a context to store the selected team id, team name
//and the team's record

import { RecordData } from "@/lib/types";
import { createContext } from "react";

export type TeamRecordProp =
  | {
      teamid?: number | null;
      teamname?: string | null | undefined;
    }
  | undefined;

export const TeamRecordContext = createContext<{
  teamRecord: TeamRecordProp;
  onUpdate: (value: TeamRecordProp) => void;
}>({
  teamRecord: undefined,

  onUpdate: (value) => {},
});
