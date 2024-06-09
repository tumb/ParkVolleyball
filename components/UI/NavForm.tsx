import { LeagueContext } from "@/context/LeagueContext";
import { TeamRecordContext } from "@/context/TeamRecordContext";
import { supabase } from "@/lib/supabase";
import { useContext, useEffect, useState } from "react";
import { fetchAllYears } from "@/components/database/fetches" ; 
import { toast } from "react-hot-toast";

export default function NavForm() {
  const leagueCtx = useContext(LeagueContext);

  const [day, setDay] = useState(leagueCtx.league?.day);
  const [year, setYear] = useState(leagueCtx.league?.year);
  const [allYears, setAllYears] = useState<number[]>([]) ; 

  async function getAllYears() {
    const years = await fetchAllYears() ; 
    setAllYears(years) ; 
    if (years.length > 0) {
      const maxYear = Math.max(...years);
      setYear(maxYear);
    }
  }

  const handleLeagueSearch = async () => {
  //  const notification = toast.loading("Searching for a league 22...");
    console.log("--- start handleLeagueSearch day: ", day) ; 
    let { data: league, error } = await supabase
      .from("league")
      .select()
      .eq("day", day)
      .eq("year", year);
    console.log(
      "🚀 ~ file: NavForm.tsx:22 ~ LeagueForm ~ league:\n",
      league
    );

    if (league?.length) {

      leagueCtx.onUpdate({
        day: league[0].day !== null ? league[0].day : "Monday",
        leagueid: league[0].leagueid,
        year: league[0].year !== null ? league[0].year : 2024,
        matchDate: "",
      });
    } else {
    //  toast.error("No league found! Please try again", { id: notification });
    }
  };


  useEffect(() => {
    getAllYears() ;
  }, [])

  useEffect(() => {
    handleLeagueSearch();
  }, [day, year]);

  return (
    <div className="mx-auto h-fit">
      <form action="" className="">
        <div className="flex items-center justify-between sm:flex-row">
          <div className="flex w-full items-center justify-between p-2">
            <label htmlFor="Day" className="px-2 text-sm font-semibold">
              Day
            </label>

            <div className="relative">
              <select
                className="min-w-full rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-sm sm:text-sm"
                placeholder="Enter Day"
                value={day!}
                onChange={(e) => setDay(e.target.value)}
              >
                <option value="Monday">Monday</option>
                <option value="Thursday">Thursday</option>
                <option value="Testday">Testday</option>
              </select>
            </div>
          </div>

          <div className="flex w-full items-center justify-between p-2">
            <label htmlFor="Year" className="px-2 text-sm font-semibold">
              Year
            </label>

            <div className="relative">
              <select
                className="min-w-full rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-sm sm:text-sm"
                placeholder="Enter Year"
                value={year!}
                onChange={(e) => setYear(parseInt(e.target.value))}
              >
               {allYears.map((yearOption) => (
                <option key={yearOption} value={yearOption}>{yearOption}</option>
               ))}
              </select>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
