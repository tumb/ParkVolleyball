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
    if (years.length > 0 && (year == null || !years.includes(year))) {
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
    <div className="nav-form-wrap">
      <form action="">
        <div className="nav-form-row">
          <div className="nav-field">
            <label htmlFor="Day" className="nav-label">
              Day
            </label>
            <select
              id="Day"
              className="nav-select"
              placeholder="Enter Day"
              value={day!}
              onChange={(e) => setDay(e.target.value)}
            >
              <option value="Monday">Monday</option>
              <option value="Thursday">Thursday</option>
              <option value="Testday">Testday</option>
            </select>
          </div>

          <div className="nav-field">
            <label htmlFor="Year" className="nav-label">
              Year
            </label>
            <select
              id="Year"
              className="nav-select"
              placeholder="Enter Year"
              value={year!}
              onChange={(e) => setYear(parseInt(e.target.value))}
            >
              {allYears.map((yearOption) => (
                <option key={yearOption} value={yearOption}>
                  {yearOption}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
      <style jsx>{`
        .nav-form-wrap {
          max-width: 540px;
        }
        .nav-form-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }
        .nav-field {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          border: 1px solid #d7e1ef;
          border-radius: 6px;
          background: #f8fbff;
        }
        .nav-label {
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
          white-space: nowrap;
        }
        .nav-select {
          min-width: 130px;
          border: 1px solid #bfd4ea;
          border-radius: 5px;
          background: #fff;
          padding: 4px 6px;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
