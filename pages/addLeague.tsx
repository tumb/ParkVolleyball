import React from "react";
import Link from "next/link";
import { useContext, useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import {LeagueProps, DivisionProps } from "@/lib/types" ;
import { getCurrentFormattedDate } from "@/components/admin/scheduling_functions/SchedulingUI";
// import '@/styles/layouts.css' ; Not allowed to add a global style sheet. I put this into ./pages/_app.tsx but don't know that I'll use it. 

let time = '10:17' ;

export default function AddLeague() 
    {
        const [warningMessage, setWarningMessage] = useState("") ;
        const [leagues, setLeagues] = useState<LeagueProps[]>([]) ;
        const [formData, setFormData] = useState({day: 'TestDay', year: 2024}) ; 
        const [day, setDay] = useState( "Testday") ;
        const [year, setYear] = useState(2024) ;
        const [divisionCount, setDivisionCount] = useState(3) ;

    const findLeaguesSearch = async () => {
          console.log("--- Started findLeaguesSearch. ") ;
          try {
            const { data: leagueData, error } = await supabase
              .from("league")
              .select().order("year", {ascending: false})
        
            if (error) {
              throw error;
            }
            setLeagues(leagueData as LeagueProps[] || []); 
          } catch (error: any) {
            console.error("Error fetching league list: " + error);
          }
        };

        // Get a list of all players when the page first loads.
        useEffect(() => {
          if(leagues == null || leagues.length == 0) {
            findLeaguesSearch() ; 
          }
        }
        ) ;

        async function onSaveLeague() {
          console.log('--- onSaveLeague called.') ;
          if(validateLeagueData()) {
            const league: LeagueProps = {day: day, year: year, leagueid: 0 } ;
            // Omit the scheduleid property from the schedule object
            const { leagueid, ...leagueWithoutId } = league;
            try {
            const { data, error } = await supabase
              .from("league")
              .insert([leagueWithoutId]);
              console.log("Saved league: ", day, " ", year) ;
            } 
            catch (error: any) {
            console.error("Error saving schedule:", error.message);
            }
            let value = 1 ; 
            let divisionNames: string[] = ["blue", "green", "red"] ; 
            var newLeagueId: number = await getLeagueId(day, year); // This is the just created league
            console.log("created new league with id: ", newLeagueId) ;
            for(let i = 0 ; i < divisionCount; i++) {
              saveDivision(0, newLeagueId, divisionNames[i], value) ;
              value = value * 2 ; 
            }
          }
          console.log("--- onSaveLeague ended") ;
      }
      
      async function saveDivision(fakeId: number, newLeagueId: number, divisionName: string, divisionValue: number) {
        console.log('--- saveDivision called.') ;
        const newDivision: DivisionProps = {leagueid: newLeagueId, divisionname: divisionName, divisionvalue: divisionValue, divisionid: fakeId } ;
          // Omit the scheduleid property from the schedule object
          const { divisionid, ...divisionWithoutId } = newDivision;
          try {
          const { data, error } = await supabase
            .from("division")
            .insert([divisionWithoutId]);
            console.log("Saved division: ", divisionName, " ", newLeagueId) ;
          } 
          catch (error: any) {
          console.error("Error saving division:", error.message);
          }
        console.log("--- saveDivision ended") ;
    }

      async function getLeagueId(day: string, year: number): Promise<number>   {
        try {
          const { data: leagueData, error } = await supabase
            .from("league").select()
            .eq("day", day).eq("year",year)
            .order("year", {ascending: false})
      
          if (error) {
            throw error;
          }
          if(leagueData.length == 1) {
            return (leagueData[0] as LeagueProps).leagueid ; 
          }
          else {
            console.log("Did not find the new league made", day, " for year ", year) ; 
            return -1 ; 
          }
        } catch (error: any) {
          console.error("Error fetching league list: " + error);
          return -1 ; 
        }
      }

      function validateLeagueData() {
        var isValid : boolean = true ; 
        isValid = isValid && year > 1970 ;
        isValid = isValid && day.length > 3 ; 
        return isValid ; 
      }

      const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
      };

      const handleDivisionCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log("--- handleDivisionCountChange: ", event.target.value) ;
        setDivisionCount(parseInt( event.target.value, 10));
      };

        return (
    <div>
      <style>
        {`
          #debuggingInfoDiv {
            background-color: pink ; 
            margin-bottom: 10px ;
          }       
          #infoPanelsDiv {
            background-color: lightgray ; 
            width: 110% ; 
            margin-bottom: 10px ;
          }     
          #newLeagueDiv {
            background-color: lightgray ; 
            width: 40% ; 
            float: left ; 
            margin-left: 10px ; 
            margin-right: 5px ; 
          }     
          #buttonColumnDiv {
            background-color: lightblue ; 
            width: 15% ; 
            height: 430px ; 
            float: left ; 
            display: flex;
            flex-direction: column;
            align-items: center ;
            margin-right: 5px ;
          }       
          #statusDiv {
            background-color: lightgreen ; 
            width: 100% ; 
            margin-top: 10px ;
          }     
          #existingLeaguesDiv {
            background-color: lightgray ; 
            width: 40% ; 
            float: left ; 
          }     
          #existingLeaguesList {
            background-color: white ; 
            width: 100% ; 
            float: left ; 
          }     
          .inputlabel {
            width: 100px ; 
            margin-bottom: 5px;
            padding: 20px;
          }
          .textInput {
            width: 150px ; 
            height: 30 ; 
            margin-bottom: 5px;
            padding: 5px;
            border: solid ;
          }
          .inlineInputContainer {
            display: flex ;
            align-items: center ;
            margin-bottom: 5px ; 
          }
          .radio-button {
            background-color: white ; 
            border: solid; 
            padding: 5px ; 
            margin-right: 10px ;
          }
        `}
      </style>
      <div id="debuggingInfoDiv">
        Add a Player
        <br/>
        <br/>
        <br/>
        <p>
        <br/>
        <br/>
        </p>
      </div>
      <div id="infoPanelsDiv" >
        <div id="newLeagueDiv">
          <div>
            <label>New League</label>
          </div><br/>
          <div className="inlineInputContainer">
            <label className="inputlabel">Day </label>
            <div className="textInputWrapper">
            <input className="textInput" type="text" name="day" id="day" placeholder = "Monday" onChange={handleInputChange}/>
            </div>
          </div>
          <div className="inlineInputContainer">
          <label className = "inputlabel">Year</label>
          <div className="textInputWrapper">
          <input className="textInput" type="text" id="year" name="year" placeholder = "2024" onChange={handleInputChange}/>
          </div>
          </div>

          <div className="inlineInputContainer">
          <label className = "inputlabel">Divisions</label>
          <div className="division-radio-group" id="division-radio-group" onChange={handleDivisionCountChange}> 
          <label htmlFor="two" className="radio-button"> <input type="radio" name="division" value="2"/>Two  </label>
          <label htmlFor="three" className="radio-button"> <input type="radio" name="division" value="3"/>Three </label>
          </div>

        </div>
        </div>
        <div id="buttonColumnDiv">
          <button className="m-4 p-4 bg-green-200 font-bold rounded-lg" onClick={onSaveLeague} >
            Save
	        </button>
          <div>
            <br/>
            <Link
                className=" m-4 p-4 bg-blue-200 font-bold rounded-lg text-black-800 transition hover:text-blue-800/75"
                href="/addPlayer"
              >
              New Players
              </Link>
          </div>
          <br/>
          <div>
            <br/>
            <Link
                className=" m-4 p-4 bg-red-200 font-bold rounded-lg text-black-800 transition hover:text-blue-800/75"
                href="/admin"
              >
                Cancel
              </Link>
          </div>
          <br/>

        </div>
        <div id="existingLeaguesDiv" > 
          <div>
            <label>Leagues already in database</label>
          </div>
          <select id="existingLeaguesList" size={20} multiple={true}> 
          {leagues.map((league) => (
            <option key={league.leagueid} value={league.leagueid}>{league.year} {league.day} </option> 
          ))}
          </select>
        </div>
      </div>  
      <div>Empty</div>
      <div id="statusDiv">
        Status Div
      </div>
      <div>Empty</div>
    </div>
  );

}



