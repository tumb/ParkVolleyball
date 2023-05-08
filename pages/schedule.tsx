import Card from "@/components/UI/Card";
import Layout from "@/components/UI/Layout";
import { supabase } from "@/lib/supabase";

const scheduleData = {
  scheduleid: 1176,
  matchdate: "2021-08-12",
  team1: "Erica",
  wins1: 2,
  team2: "Patti",
  wins2: 0,
  divisionname: "green",
  leagueid: 6,
};

type ScheduleProps = {
  scheduleid: number;
  matchdate: string;
  team1: string;
  wins1: number;
  team2: string;
  wins2: number;
  divisionname: string;
  leagueid: number;
};

export default function schedule({ schedule }: { schedule: ScheduleProps[] }) {
  // const matchDate = new Date(schedule[0].matchdate).toLocaleDateString();
  const matchDate = schedule[0].matchdate;

  return (
    <Layout>
      {/* <pre>{JSON.stringify(schedule, null, 2)}</pre> */}

      <h1 className="text-3xl font-semibold">Schedule</h1>
      <h2 className="text-2xl">
        Match Date: <span className="font-semibold">{matchDate}</span>
      </h2>
      {schedule?.map((schedule: ScheduleProps) => (
        <Card
          key={schedule.scheduleid}
          team1={schedule.team1}
          team2={schedule.team2}
        />
      ))}
    </Layout>
  );
}

// query data from supabase with get serverside props
export async function getServerSideProps() {
  //Make a supabase js query to get the data from this sql query
  const { data, error } = await supabase.rpc("select_schedule2");

  if (error) {
    console.log(
      "🚀 ~ file: index.tsx:30 ~ getServerSideProps ~ error: \n",
      error
    );
    return {
      props: {
        schedule: error,
      },
    };
  }

  return {
    props: {
      schedule: data,
    },
  };
}
