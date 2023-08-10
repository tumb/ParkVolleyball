import Cta from "@/components/UI/Cta";
import Hero from "@/components/UI/Hero";
import LeagueForm from "@/components/UI/LeagueForm";

export default function Home() {
  return (
    <div>
      <section className="bg-[url('../assets/Shelagh_2023.png')]   bg-cover bg-center bg-no-repeat ">
        <LeagueForm />
      </section>
      <Hero />
    </div>
  );
}
