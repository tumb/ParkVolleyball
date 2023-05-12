import Card from "@/components/UI/Card";
import Layout from "@/components/UI/Layout";
import ScheduleTable from "@/components/UI/Table";
import { supabase } from "@/lib/supabase";

export type ScheduleProps = {
  scheduleid: number;
  matchdate: string;
  team1: {
    teamname: string;
  };
  wins1: number;
  team2: {
    teamname: string;
  };
  wins2: number;
  divisionid: { divisionname: string };
  leagueid: number;
};

export default function schedule({
  schedules,
}: {
  schedules: ScheduleProps[];
}) {
  // const matchDate = new Date(schedule[0].matchdate).toLocaleDateString();
  const matchDate = schedules[0].matchdate;

  return (
    <Layout>
      {/* <pre>{JSON.stringify(schedules, null, 2)}</pre> */}

      <h1 className="text-3xl font-semibold">Schedule</h1>
      <h2 className="text-2xl">
        Match Date: <span className="font-semibold">{matchDate}</span>
      </h2>

      <div className="w-full">
        <ScheduleTable schedules={schedules} />
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  const { data, error } = await supabase
    .from("schedule")
    .select(
      `*, scheduleid, matchdate, team1: team1(teamname), team2: team2(teamname), divisionid: division("divisionname")`
    );

  if (error) {
    console.log(
      "🚀 ~ file: index.tsx:30 ~ getServerSideProps ~ error: \n",
      error
    );
    return {
      props: {
        schedules: error,
      },
    };
  }

  return {
    props: {
      schedules: data,
    },
  };
}
