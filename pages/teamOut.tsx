import React from "react";
import Link from "next/link";
import { useContext, useEffect, useState, useCallback } from "react";
import { LeagueContext } from "@/context/LeagueContext";
import { supabase } from "@/lib/supabase";
import { ScheduleProps, TeamProps, emptyTeam } from "@/lib/types" ;
import { findSelectedTeam, isValidDate } from "@/components/admin/scheduling_functions/SchedulingUI" ;
import { saveToSupabase } from "@/components/database/savesOrModifications";
import { findDatesForLeague, fetchMatchesForTeam, findTeamsForLeague } from "@/components/database/fetches";
import { deleteFromSupabase } from "@/components/database/deletes";

// import '@/styles/layouts.css' ; Not allowed to add a global style sheet. I put this into ./pages/_app.tsx but don't know that I'll use it. 

export default function TeamOut() 
    {
      const leagueCtx = useContext(LeagueContext);
        const [selectedDate, setScheduleDate] = useState<string>("yyyy-mm-dd") ;
        const [teamsInLeague, setTeamsInLeague] = useState<TeamProps[]>([]) ; 
        const [allDates, setAllDates] = useState<string[]>([]) ; 
        const [selectedTeam, setSelectedTeam] = useState<TeamProps>(emptyTeam) ;
        const [warningMessage, setWarningMessage] = useState("") ;
        const [successMessage, setSuccessMessage] = useState("") ;
        const [errorMessage, setErrorMessage] = useState("") ;
        const [tempMatchId, setTempMatchId] = useState(-1) ;
        const [isPageInitialized, setIsPageInitialized] = useState(false) ; 
        let tempDates : string[] = [] ; 


        function addNextDate(dayOfWeek : string) {
          const currentDate = new Date(); // apparenty a number of time since ??? in milliseconds
          // Get the current day of the week (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
          const currentDay = currentDate.getDay();
          // Get the day of the week as an integer (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
          let targetDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(dayOfWeek.toLowerCase());
          if(targetDay == -1) {
            targetDay = 3 ; // Using wednesday for testday or a missing day.
          }
          // Calculate the number of days until the next occurrence of the target day
          let daysUntilNext = targetDay - currentDay;
          // console.log("daysUntilNext: " + daysUntilNext) ; 
          if (daysUntilNext <= 0) {
              // If the target day is earlier in the week than the current day, add 7 days to find the next occurrence
            daysUntilNext += 7;
          }
          // Calculate the date of the next occurrence of the target day
          const nextDate = new Date(currentDate.getTime() + daysUntilNext * 24 * 60 * 60 * 1000);
          // Format the date as YYYY-MM-DD
          const formattedDate = nextDate.toISOString().split('T')[0];
          const index = allDates.indexOf(formattedDate) ; 
          // console.log("Adding first date: length ", allDates.length) ; 
          if( index == -1) { // If it's not already in the list then add it.
            tempDates.push(formattedDate) ; 
            // console.log("Added first date: length ", tempDates.length) ; 
          }

          // Add still one more day if today is the day of week for the league
          if(daysUntilNext == 7) {
            daysUntilNext += 7;
            const nextDate = new Date(currentDate.getTime() + daysUntilNext * 24 * 60 * 60 * 1000);
            // Format the date as YYYY-MM-DD
            const formattedDate = nextDate.toISOString().split('T')[0];
            const index = allDates.indexOf(formattedDate) ; 
            // console.log("Adding 2nd date: length ", allDates.length) ; 
            if( index == -1) {
              tempDates.push(formattedDate) ; 
              console.log("Added another date: length ", tempDates.length) ; 
            }
            // console.log("After sorting dates: length ", allDates.length) ; 
          }

          while(daysUntilNext < 90) {
            daysUntilNext += 7;
            const nextDate = new Date(currentDate.getTime() + daysUntilNext * 24 * 60 * 60 * 1000);
            // Format the date as YYYY-MM-DD
            const formattedDate = nextDate.toISOString().split('T')[0];
            const index = allDates.indexOf(formattedDate) ; 
            // console.log("Adding date:  ", formattedDate) ; 
            if( index == -1) {
              tempDates.push(formattedDate) ; 
              console.log("In loop of future dates, added date: length ", tempDates.length) ; 
            }
            tempDates.sort() ; 
            // console.log("After sorting dates: length ", allDates.length) ; 
          }

          tempDates.sort() ; 
          setAllDates(tempDates) ; 
          console.log("created date: " + formattedDate + " and now have allDates.length: " + allDates.length + " and tempDates.length: " + tempDates.length) ; 
        }

        function buildTeamOutItem() {
          return (
            <div >
              {selectedTeam.teamname} {selectedDate} <br/> 
            </div>
          )
        }

        function clearMessages() {
          setSuccessMessage("") ; 
          setWarningMessage("No warnings.") ; 
          setErrorMessage("No Errors") ;
        }

        function fetchAllDatesForLeague (leagueId : number) { 
          async function innerFetch() {
            const savedDates = await findDatesForLeague(leagueId ) ; 
            console.log("putting in dates from database: " + savedDates.length) ;
            setAllDates(savedDates) ;
          }
          innerFetch() ; 
        }

        function fetchAllTeamsForLeague () { 
          async function innerFetch() {
            const allTeams = await findTeamsForLeague(leagueCtx.league.leagueid != undefined ? leagueCtx.league.leagueid : -1 ) ; 
            setTeamsInLeague(allTeams) ;
          }
          innerFetch() ; 
        }
  
          /*** Either first time on the page or a change in the league. */
        function initializePage() {
          console.log("started initializePage. flag: " , isPageInitialized, " leagueId: ", leagueCtx.league.leagueid) ; 
          const leagueId = leagueCtx.league.leagueid != undefined ? leagueCtx.league.leagueid : 0 ; 
          fetchAllDatesForLeague(leagueId) ;
          addNextDate(leagueCtx.league.day != undefined ? leagueCtx.league.day : "Testday" ) ; 
        }

        const dateHandler = (e: React.ChangeEvent<HTMLSelectElement>) =>  {
          console.log("-- Started dateHandler. scheduleDate: " + selectedDate) ;
          console.log("e.target.value: " + e.target.value) ;
          if(isValidDate(e.target.value)) {
            setScheduleDate(e.target.value) ; 
            // findDistinctDivisionsSearch() ;
            setWarningMessage("") ; 
          }
          else {
            setWarningMessage("No valid date is set") ; 
          }
          console.log("--- end of dateHandler.") ; 
        } ;

      function onBackArrowClick() {
      }

      function onDeleteFromDatabase() {
        console.log('--- onDeleteFromDatabase called.') ;
            setSuccessMessage("Deleted one or more matches.")
      }

      function onSaveTeamOut() {

      }

      const onTeamSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedTeamId = parseInt(e.target.value, 10);
        const selectedTeam = teamsInLeague.find(team => team.teamid === selectedTeamId);
        setSelectedTeam(selectedTeam || emptyTeam);
        }

      function onPairTwoTeamsButtonClick() {
          console.log("--- onPairTwoTeamsButtonClick started") ;
          console.log("--- onPairTwoTeamsButtonClick ended") ;
        }
      
        const updateTeams = () => {
          console.log("Teams found: " + teamsInLeague.length) ; 
        }

        // When scheduleDate changes to something valid
        useEffect(() => {
          // Put code to run when the date is changed.
          // console.log("Selected date: ", selectedDate) ;
          leagueCtx.league.matchDate = selectedDate ; 
      }, [selectedDate]) ; 

        useEffect(() => {
            initializePage() ; 
      }, [leagueCtx]) ; 

      useEffect(() => {
        if(!isPageInitialized) {
          initializePage() ;
          setIsPageInitialized(true) ; 
          }
        }, []) ;

        return (
    <div>
      <style>
        {`
          #debuggingInfoDiv {
            background-color: pink ; 
            margin-bottom: 10px ;
            margin-left: 20px ; 
            padding: 10px ; 
          }       
          #selectionsDiv {
            width: 110% ; 
            margin-bottom: 10px ;
          }     
          #successDiv {
            color: green ; 
          }
            #warningDiv {
            color: purple ; 
          }
            #errorDiv {
            color: red ; 
          }
          #teamsSelectionDiv {
            width: 15% ; 
            float: left ; 
            margin-left: 10px ; 
            margin-right: 5px ; 
          }     
          #buttonColumnDiv {
            background-color: lightgray ; 
            width: 10% ; 
            height: 430px ; 
            float: left ; 
            display: flex;
            flex-direction: column;
            align-items: center ;
            margin-right: 5px ;
          }       
          .column-button {
            display: inline-block;
            padding: 10px 20px; /* Adjust padding as needed */
            margin: 5px ;
            background-color: #BDF;
            border: none;
            text-decoration: none;
            font-weight: bold;
            color: #000;
            border-radius: 5px;
            width: 100px; /* Set the width as desired */
            text-align: center;          
          }
          .dangerous-button {
            display: inline-block;
            padding: 10px 20px; /* Adjust padding as needed */
            margin: 5px ;
            background-color: #FAB;
            border: none;
            text-decoration: none;
            font-weight: bold;
            color: #000;
            border-radius: 5px;
            width: 100px; /* Set the width as desired */
            text-align: center;          
          }
          #dateSelectionDiv {
            padding: 10px ;
          }     
          #teamsSelect {
            background-color: #E0E8F0 ; 
            width: 100% ; 
            float: left ; 
          }     
          #teamsOutSelect {
            background-color: #E0E8F0 ; 
            width: 100% ; 
            float: left ; 
          } 
        `}
      </style>
      <div id="debuggingInfoDiv">
        Team that is out for the week.
        <br/>
        League ID: {leagueCtx.league?.leagueid}, League day: {leagueCtx.league?.day}, League year: {leagueCtx.league?.year}, dates length, {allDates.length}
        <br/>
      </div>
      <div id="selectionsDiv" >
        <div id="dateSelectionDiv">
          Select a date
          <br/>
          <select id="dateSelect" multiple={false} onChange={onTeamSelectChange}> 
          {allDates.map((date) => (
            <option key={date} value={date}>{date}</option> 
          ))}
          </select>
        </div>
        <div id="teamsSelectionDiv">
          <div>
            <label>Select Team That Is Out</label>
          </div>
          <select id="teamsSelect" size={15} multiple={true} onChange={onTeamSelectChange}> 
          {teamsInLeague.map((team) => (
            <option key={team.teamid} value={team.teamid}>{team.teamname}</option> 
          ))}
          </select>
        </div>
        <div id="buttonColumnDiv">
        <br/>
          <div>
            <button className="column-button" onClick={onPairTwoTeamsButtonClick} >
		          → 
	          </button>
          </div>
          <div>
            <button className="column-button" onClick={onBackArrowClick} >
		          ← 
	          </button>
          </div>
          <button className="column-button" onClick={onSaveTeamOut} >
            Save
	        </button>
          <div>
          <button className="dangerous-button" onClick={onDeleteFromDatabase} >
            Delete
	        </button>
          </div>
          <div>
            <br/>
            <Link
                className="dangerous-button"
                href="/admin"
              >
                Cancel
              </Link>
          </div>
        </div>
        <div> 
            <label>Teams out on {leagueCtx.league.day}, {selectedDate}</label>
          <select id="teamsOutSelect" size={20} multiple={false}> 
          </select>
        </div>
      </div>  
      <div id="successDiv">
        {successMessage}
      </div>
      <div id="warningDiv" style={{ whiteSpace: 'pre-line' }}>
        {warningMessage}
      </div>
      <div id="errorDiv">
        {errorMessage}
      </div>
    </div>
  );
  }


