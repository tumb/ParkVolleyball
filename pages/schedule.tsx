import { supabase } from "@/lib/supabase";

export default function schedule({ posts }) {
  return (
    <main className="">
      <div>Hello world</div>
      <pre>{JSON.stringify(posts, null, 2)}</pre>
    </main>
  );
}

// query data from supabase with get serverside props
export async function getServerSideProps() {
  //Make a supabase js query to get the data from this sql query
  const { data, error } = await supabase
    .from("schedule")
    .select(
      `*, team1: team(teamname), team2: team(teamname), leagueid: league(*)`
    );

  if (error) {
    return {
      props: {
        posts: error,
      },
    };
  }

  return {
    props: {
      posts: data,
    },
  };
}
