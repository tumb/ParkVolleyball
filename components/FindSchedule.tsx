import React, { useEffect, useState } from "react";
import ScheduleForm from "./UI/ScheduleForm";
import { supabase } from "@/lib/supabase";
import { ScheduleFormData } from "@/lib/types";

export type GetScheduleProps = Awaited<ReturnType<typeof getSchedule>>;

async function getSchedule() {
  return await supabase
    .from("schedule")
    .select(
      `*, scheduleid, matchdate, team1: team1(teamname), team2: team2(teamname), divisionid: division("divisionname")`
    )
    .eq("leagueid", 2)
    .order("matchdate", { ascending: false });
}

const INITIAL_DATA = {
  day: "",
  date: "",
  division: "",
  year: "",
};

export default function FindSchedule() {
  const [data, setData] = useState(INITIAL_DATA);
  const [schedules, setSchedules] = useState<GetScheduleProps>();
  function updateFields(fields: Partial<ScheduleFormData>) {
    setData((prev) => {
      return { ...prev, ...fields };
    });
  }

  const handleScheduleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: schedules, error } = await supabase
      .from("schedule")
      .select(
        `*, scheduleid, matchdate, team1: team1(teamname), team2: team2(teamname), divisionid: division("divisionname")`
      )
      .eq("leagueid", 2)
      .order("matchdate", { ascending: false });

  };

  const getSchedules = async () => {
    const { data, error } = await supabase
      .from("schedule")
      .select(
        `*, scheduleid, matchdate, team1: team1(teamname), team2: team2(teamname), divisionid: division("divisionname")`
      )
      .eq("leagueid", 2)
      .order("matchdate", { ascending: false });

    if (data) {
      // setSchedules(data);
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
      {/* {schedule.length ? (
        <ScheduleTable schedules={schedules} />
      ) : (
        <div>loading... </div>
      )} */}
    </div>
  );
}
