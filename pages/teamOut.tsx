import React from "react";
import Link from "next/link";
import { useContext, useEffect, useState, useCallback } from "react";
import { LeagueContext } from "@/context/LeagueContext";
import { supabase } from "@/lib/supabase";
import { TeamOutProps, TeamProps} from "@/lib/types" ;
import { findSelectedTeam, isValidDate } from "@/components/admin/scheduling_functions/SchedulingUI" ;
import { saveOutTeamsToDatabase, saveToSupabase } from "@/components/database/savesOrModifications";
import { findDatesForLeague, findOutTeamsForLeagueAndDate, findTeamsForLeague } from "@/components/database/fetches";
import { deleteTeamOutFromSupabase } from "@/components/database/deletes";

// import '@/styles/layouts.css' ; Not allowed to add a global style sheet. I put this into ./pages/_app.tsx but don't know that I'll use it. 

export default function TeamOut() 
    {
      const leagueCtx = useContext(LeagueContext);
        const [teamsInLeague, setTeamsInLeague] = useState<TeamProps[]>([]) ; 
        const [allDates, setAllDates] = useState<string[]>([]) ; 
        const [outTeamsNew, setOutTeamsNew] = useState<TeamProps[]>([]) ; 
        const [outTeamsInDatabase, setOutTeamsInDatabase] = useState<TeamProps[]>([]) ; 
        const [selectedDate, setSelectedDate] = useState<string>("yyyy-mm-dd") ;
        const [warningMessage, setWarningMessage] = useState("") ;
        const [successMessage, setSuccessMessage] = useState("") ;
        const [errorMessage, setErrorMessage] = useState("") ;
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
          // console.log("Adding first date: length ", allDates.length) ; 
          if( ! dateExists(formattedDate)) { // If it's not already in the list then add it.
            tempDates.push(formattedDate) ; 
            // console.log("Added first date: length ", tempDates.length) ; 
          }

          // Add still one more day if today is the day of week for the league
          if(daysUntilNext == 7) {
            daysUntilNext += 7;
            const nextDate = new Date(currentDate.getTime() + daysUntilNext * 24 * 60 * 60 * 1000);
            // Format the date as YYYY-MM-DD
            const formattedDate = nextDate.toISOString().split('T')[0];
            // console.log("Adding 2nd date: length ", allDates.length) ; 
            if( ! dateExists(formattedDate)) {
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
            // console.log("Adding date:  ", formattedDate) ; 
            if( ! dateExists(formattedDate)) {
              tempDates.push(formattedDate) ; 
              console.log("In loop of future dates, added date:  ", formattedDate) ; 
            }
            tempDates.sort() ; 
            // console.log("After sorting dates: length ", allDates.length) ; 
          }

          tempDates.sort() ; 
          setAllDates(tempDates) ; 
          console.log("created date: " + formattedDate + " and now have allDates.length: " + allDates.length + " and tempDates.length: " + tempDates.length) ; 
        }

        function buildTeamOutItem(team: TeamProps) {
          return (
            <div >
              {team.teamname} {selectedDate} <br/> 
            </div>
          )
        }

        function clearMessages() {
          setSuccessMessage("") ; 
          setWarningMessage("No warnings.") ; 
          setErrorMessage("No Errors") ;
        }

        function dateExists(newDate : string) {
          let exists = true ; 
          const allIndex = allDates.indexOf(newDate) ;
          const tempIndex = tempDates.indexOf(newDate) ; 
          exists = allIndex > -1 || tempIndex > -1 ; 
          return exists ; 
        }

        function fetchAllDatesForLeague (leagueId : number) { 
          async function innerFetch() {
            const savedDates = await findDatesForLeague(leagueId ) ; 
            console.log("putting in dates from database: " + savedDates.length) ;
            setAllDates(savedDates) ;
            return savedDates ; 
          }
          const savedDates = innerFetch() ; 
          return savedDates ; 
        }

        function fetchAllTeamsForLeague () { 
          async function innerFetch() {
            const databaseTeams = await findTeamsForLeague(leagueCtx.league.leagueid != undefined ? leagueCtx.league.leagueid : -1 ) ; 
            setTeamsInLeague(databaseTeams) ;
          }
          innerFetch() ; 
        }
  
        function fetchOutTeamsForLeagueAndDate() { 
          async function innerFetch() {
            const databaseOutTeamIds = await findOutTeamsForLeagueAndDate(leagueCtx.league.leagueid != undefined ? leagueCtx.league.leagueid : -1, selectedDate ) ; 
            const databaseOutTeams = teamsInLeague.filter(team => databaseOutTeamIds.includes(team.teamid)) ;
            setOutTeamsInDatabase(databaseOutTeams) ;
          }
          innerFetch() ; 
        }
  
        function getSelectedTeams() : TeamProps[] {
          const teamsSelect = document.getElementById("teamsSelect") as HTMLSelectElement;
          const selectedOptions = Array.from(teamsSelect.selectedOptions);
          const selectedTeamIds = selectedOptions.map(option => parseInt(option.value));
          const selectedTeams = teamsInLeague.filter(team => selectedTeamIds.includes(team.teamid));
          return selectedTeams ;
        }

        function getSelectedOutTeams() : TeamProps[] {
          const teamsSelect = document.getElementById("teamsOutSelect") as HTMLSelectElement;
          const selectedOptions = Array.from(teamsSelect.selectedOptions);
          const selectedTeamIds = selectedOptions.map(option => parseInt(option.value));
          const selectedOutTeams = teamsInLeague.filter(team => selectedTeamIds.includes(team.teamid));
          return selectedOutTeams ;
        }

          /*** Either first time on the page or a change in the league. */
        async function initializePage() {
          console.log("started initializePage. flag: " , isPageInitialized, " leagueId: ", leagueCtx.league.leagueid) ; 
          const leagueId = leagueCtx.league.leagueid != undefined ? leagueCtx.league.leagueid : 0 ; 
          tempDates.length = 0 ; 
          try {
          await fetchAllDatesForLeague(leagueId) ;
          fetchAllTeamsForLeague() ;
          addNextDate(leagueCtx.league.day != undefined ? leagueCtx.league.day : "Testday" ) ; 
          } catch (error) {
            setErrorMessage("Error retrieving dates from database. " ) ; 
          };
        }

      function onLeftArrowClick() {
        const teamsNoLongerOut = getSelectedOutTeams() ;
        const teamsStillOut = outTeamsNew.filter((team) => !teamsNoLongerOut.includes(team)) ;
        setOutTeamsNew(teamsStillOut) ;
      }

      function onDeleteFromDatabase() {
        clearMessages() ; 
        const outTeamsSelected = getSelectedOutTeams();
        if (outTeamsSelected.length > 0) {
          const teamsToDelete = outTeamsSelected.filter(team => 
            outTeamsInDatabase.some(databaseTeam => databaseTeam.teamid === team.teamid)
          );
          if (teamsToDelete.length > 0) {
            let message = "Successfully deleted from " + selectedDate + " teams: " ; 
            for(const team of teamsToDelete) {
              deleteTeamOutFromSupabase(team, selectedDate) ;
              message += team.teamname + " " ;
            }
            setOutTeamsInDatabase(outTeamsInDatabase.filter(team => !teamsToDelete.some(deleteTeam => deleteTeam.teamid === team.teamid))) ; 
            setSuccessMessage(message) ; 
          } else {
            setWarningMessage("No teams selected for deletion that are in the database.");
          }
        } else {
          setWarningMessage("No teams selected for deletion.");
        }
      }

      const onDateSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedDate(e.target.value);
        }

      /**
       * The order is a bit strange. 
       * 1) Create an array of the newly selected teams. 
       * 2) Check all teams already in the list to new outTeams and add any not in the list to the new array
       * 3) Store the new array as new outTeams. 
       * The order is so that the storing of the new array will trigger a rerender of the page.
       * @returns 
       */
      function onRightArrowClick() {
        const teamsSelected = getSelectedTeams() ;
        console.log("teamsSelected.length: ", teamsSelected.length) ; 
        for(const team of outTeamsNew) {
          if(teamsSelected.indexOf(team) == -1 ) {
            teamsSelected.push(team) ; 
            console.log("pushing team: ", team.teamname) ;
          }
          console.log("teamsSelected.length: ", teamsSelected.length) ; 
        }
        setOutTeamsNew(teamsSelected) ; // Need this to force rerender.
      }
      
      async function onSaveTeamOut() {
        clearMessages() ; 
        let message = "Successfully saved for " + selectedDate + " teams out: " ; 
        if(isValidDate(selectedDate)) {
          await saveOutTeamsToDatabase(outTeamsNew, selectedDate) ;
          for(const team of outTeamsNew) {
            message += team.teamname + " " ; 
          }
          setSuccessMessage(message) ; 
        }
        else {
          setWarningMessage("The date, " + selectedDate + ", is invalid. Choose another one." )
        }
      }

        // When scheduleDate changes to something valid
        useEffect(() => {
          // Put code to run when the date is changed.
          // console.log("Selected date: ", selectedDate) ;
          leagueCtx.league.matchDate = selectedDate ; 
          outTeamsNew.length = 0 ; 
          fetchOutTeamsForLeagueAndDate() ;
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
          #successDiv {
            color: green ; 
          }
          #warningDiv {
            color: orange ; 
          }
            #errorDiv {
            color: red ; 
          }
          #selectionsDiv {
            width: 100% ; 
            margin-bottom: 10px ;
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
          #teamsOutDiv {
            width: 15% ; 
            float: left ; 
            margin-left: 10px ; 
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
            height: 400px ; 
            float: left ; 
          }     
          #teamsOutSelect {
            background-color: #E0E8F0 ; 
            width: 15% ; 
            float: left ; 
            height: 400px ; 
          } 
        `}
      </style>
      <div id="debuggingInfoDiv">
        Team that is out for the week.
        <br/>
        League ID: {leagueCtx.league?.leagueid}, League day: {leagueCtx.league?.day}, League year: {leagueCtx.league?.year}, dates length, {allDates.length}
        <br/>
        Selected Teams: {outTeamsNew.length}
      </div>
      <div id="selectionsDiv" >
        <div id="dateSelectionDiv">
          Select a date
          <br/>
          <select id="dateSelect" multiple={false} onChange={onDateSelectChange}> 
          {allDates.map((date) => (
            <option key={date} value={date}>{date}</option> 
          ))}
          </select>
        </div>
        <div id="teamsSelectionDiv">
          <div>
            <label>Select Team That Is Out</label>
          </div>
          <select id="teamsSelect" size={15} multiple={true}> 
          {teamsInLeague.map((team) => (
            <option key={team.teamid} value={team.teamid}>{team.teamname}</option> 
          ))}
          </select>
        </div>
        <div id="buttonColumnDiv">
        <br/>
          <div>
            <button className="column-button" onClick={onRightArrowClick} >
		          → 
	          </button>
          </div>
          <div>
            <button className="column-button" onClick={onLeftArrowClick} >
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
        <div className="teamsOutDiv"> 
            <label>Teams out on {leagueCtx.league.day}, {selectedDate}</label>
            <br/>
          <select id="teamsOutSelect" size={15} multiple={false}> 
          {outTeamsInDatabase.map((team) => (
            <option key={team.teamid} value={team.teamid}>{team.teamname}</option> 
          ))}
          {outTeamsNew.map((team) => (
            <option key={team.teamid} value={team.teamid}>{team.teamname}</option> 
          ))}
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


