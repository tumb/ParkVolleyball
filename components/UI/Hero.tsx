import React, { useState } from "react";
import UnderLineTabs from "./UnderLineTabs";
import StandingsWrapper from "../StandingsWrapper";
import ScheduleWrapper from "../ScheduleWrapper";

export default function Hero() {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [standingsOpen, setStandingsOpen] = useState(true);
  return (
    <div>
      <UnderLineTabs
        setScheduleOpen={setScheduleOpen}
        setStandingsOpen={setStandingsOpen}
        standingsOpen={standingsOpen}
        scheduleOpen={scheduleOpen}
      />
      {scheduleOpen && <ScheduleWrapper />}
      {standingsOpen && <StandingsWrapper />}
    </div>
  );
}
