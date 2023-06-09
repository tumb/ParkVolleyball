/* eslint-disable react-hooks/rules-of-hooks */
import TeamWrapper from "@/components/teamRecords/TeamWrapper";
import { TeamRecordContext, TeamRecordProp } from "@/context/TeamRecordContext";
import { useState } from "react";

export default function index() {
  const [recordData, setrecordData] = useState<TeamRecordProp>();

  return (
    <TeamRecordContext.Provider
      value={{
        teamRecord: recordData,
        onUpdate: (value: TeamRecordProp) => {
          setrecordData(value);
        },
      }}
    >
      <TeamWrapper />
    </TeamRecordContext.Provider>
  );
}
