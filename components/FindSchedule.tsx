import React, { useEffect, useState } from "react";
import ScheduleForm from "./UI/ScheduleForm";
import schedule, { ScheduleData, ScheduleFormData } from "@/pages/schedule";
import { supabase } from "@/lib/supabase";
import ScheduleTable from "./UI/Table";

const INITIAL_DATA = {
  day: "",
  date: "",
  division: "",
  year: "",
};

export default function FindSchedule() {
  const [data, setData] = useState(INITIAL_DATA);
  const [schedules, setSchedules] = useState<ScheduleData>([]);
  function updateFields(fields: Partial<ScheduleFormData>) {
    setData((prev) => {
      return { ...prev, ...fields };
    });
  }

  const handleScheduleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(
      "🚀 ~ file: FindSchedule.tsx:14 ~ FindSchedule ~ data: \n",
      data
    );

    const { data: schedules, error } = await supabase
      .from("schedule")
      .select(
        `*, scheduleid, matchdate, team1: team1(teamname), team2: team2(teamname), divisionid: division("divisionname")`
      )
      .eq("leagueid", 2);
    console.log(
      "🚀 ~ file: FindSchedule.tsx:33 ~ handleScheduleSearch ~ schedule: \n",
      schedules
    );
  };

  const getSchedules = async () => {
    const { data, error } = await supabase
      .from("schedule")
      .select(
        `*, scheduleid, matchdate, team1: team1(teamname), team2: team2(teamname), divisionid: division("divisionname")`
      )
      .eq("leagueid", 2);
    console.log(
      "🚀 ~ file: FindSchedule.tsx:33 ~ handleScheduleSearch ~ schedule: \n",
      data
    );

    if (data) {
      setSchedules(data);
    }
  };

  useEffect(() => {
    getSchedules();
  }, []);

  return (
    <div>
      <ScheduleForm
        {...data}
        updateFields={updateFields}
        handleScheduleSearch={handleScheduleSearch}
      />

      {/* TODO: Add schecule table here */}
      {schedule.length ? (
        <ScheduleTable schedules={schedules} />
      ) : (
        <div>loading... </div>
      )}
    </div>
  );
}
