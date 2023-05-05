import { supabase } from "@/lib/supabase";

export default function Home({ posts }) {
  return (
    <main className="">
      <div>Hello world</div>
      <pre>{JSON.stringify(posts, null, 2)}</pre>
    </main>
  );
}

// query data from supabase with get serverside props
export async function getServerSideProps() {
  const { data, error } = await supabase.from("league").select();

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
