import FindSchedule from "@/components/FindSchedule";
import Layout from "@/components/UI/Layout";

export default function schedule() {
  return (
    <Layout>
      {/* <pre>{JSON.stringify(schedules, null, 2)}</pre> */}
      <FindSchedule />
      <h1 className="text-3xl font-semibold">Schedule</h1>
      <h2 className="text-2xl">
        Match Date: <span className="font-semibold">matchDate</span>
      </h2>

      <div className="w-full">
        {/*TODO: <ScheduleTable schedules={schedules} /> */}
      </div>
    </Layout>
  );
}

// export async function getServerSideProps() {
//   const { data, error } = await supabase
//     .from("schedule")
//     .select(
//       `*, scheduleid, matchdate, team1: team1(teamname), team2: team2(teamname), divisionid: division("divisionname")`
//     );

//   if (error) {
//     console.log(
//       "🚀 ~ file: index.tsx:30 ~ getServerSideProps ~ error: \n",
//       error
//     );
//     return {
//       props: {
//         schedules: error,
//       },
//     };
//   }

//   return {
//     props: {
//       schedules: data,
//     },
//   };
// }
