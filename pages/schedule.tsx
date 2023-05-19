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