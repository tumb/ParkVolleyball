import React from "react";
import Link from "next/link";
import { useContext, useEffect, useState, useCallback } from "react";
import { LeagueContext } from "@/context/LeagueContext";
import SchedulingSetup from "@/components/UI/SchedulingSetup";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import {DivisionProps, ScheduleProps, SchedulingSetupProps, TeamProps, ScheduleData } from "@/lib/types" ;
import {findSelectedDivision, isValidDate, createMatch} from "@/components/admin/scheduling_functions/SchedulingUI" ;
import { saveToSupabase } from "@/components/database/fetches";

// import '@/styles/layouts.css' ; Not allowed to add a global style sheet. I put this into ./pages/_app.tsx but don't know that I'll use it. 

let time = '10:17' ;

export default function MakeSchedule() 
    {
      const leagueCtx = useContext(LeagueContext);
        const [scheduleDate, setScheduleDate] = useState("yyyy-mm-dd") ;
        const [divisions, setDivisions] = useState<DivisionProps[]>([]) ; 
        const [teams, setTeams] = useState<TeamProps[]>([]) ; 
        const [selectedDivision, setSelectedDivsion] = useState(({divisionid: 1, leagueid: 1, divisionname: "purple", divisionvalue: 1})) ;
        const [matches, setMatches] = useState<ScheduleProps[]>([]) ;
        const [warningMessage, setWarningMessage] = useState("") ;

        var tempMatchId = 0 ; 

        const divisionHandler = (e: React.ChangeEvent<HTMLSelectElement>) =>  {
          // console.log("--- Started divisionHandler ---") ; 
          // console.log("e.target.value: " + e.target.value) ;
          var divId = parseInt(e.currentTarget.value, 10) ; 
          const selectedDiv = findSelectedDivision(divId, divisions) ;
          // console.log("selectedDiv: ", selectedDiv) ;
          if(selectedDiv) {
            setSelectedDivsion(selectedDiv) ;
          }
        }


        const updateTeams = () => {
          findTeamsSearch() ; 
          console.log("Teams found: " + teams.length) ; 
        }


        const updateTeamsCallback = useCallback(() => {
          updateTeams();
        }, [updateTeams]);

        useEffect(() => {
          if(selectedDivision) {
            leagueCtx.league.divisionName = selectedDivision.divisionname ; 
            // console.log("selectedDivision: " + selectedDivision.divisionname)  ;
            // console.log("league context division name: " + leagueCtx.league?.divisionName) ;
            updateTeams() ;
          } 
          // console.log("--- End divisionHandler ---") ;
        }, [selectedDivision, leagueCtx.league]) ;

        const dateHandler = (e: React.ChangeEvent<HTMLInputElement>) =>  {
          console.log("-- Started dateHandler. scheduleDate: " + scheduleDate) ;
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

        // When scheduleDate changes to something valid
        useEffect(() => {
          // Put code to run when the date is changed.
          console.log("Made valid date: ", scheduleDate) ;
      }, [scheduleDate]) ; 

        const findDistinctDivisionsSearch = async () => {
          console.log("--- Started findDistinctDivisionsSearch league: ", leagueCtx.league?.leagueid) ;
          try {
            const { data: divisionsData, error } = await supabase
              .from("division")
              .select()
              .eq("leagueid", leagueCtx.league?.leagueid);
        
            if (error) {
              throw error;
            }
            setDivisions(divisionsData as DivisionProps[] || []); // Ensure that divisionsData is an array
            console.log("---  findDistinctDivisionsSearch found data:", divisionsData);
          } catch (error: any) {
            console.error("Error fetching divisions:" + error);
          }
        };

    const findTeamsSearch = async () => {
          // console.log("Started findTeamsSearch. division is: ", selectedDivision.divisionid) ;
          try {
            const { data: teamData, error } = await supabase
              .from("team")
              .select()
              .eq("leagueid", leagueCtx.league?.leagueid)
              .eq("divisionid", selectedDivision.divisionid);
        
            if (error) {
              throw error;
            }
        
            setTeams(teamData as TeamProps[] || []); 
            console.log("findTeamsSearch found data:", teamData);
          } catch (error: any) {
            console.error("Error fetching divisions:" + error);
          }
        };

        useEffect(() => {
          findDistinctDivisionsSearch() ;
        }, [leagueCtx.league]) ; 

        function onPairTwoTeamsButtonClick() {
          console.log("--- onPairTwoTeamsButtonClick started") ;
            // Get the teamsSelect element
            const teamsSelect = document.getElementById("teamsSelect") as HTMLSelectElement;
            const matchesSelect = document.getElementById("matchesSelect") as HTMLSelectElement;
        
            // Get the selected options
            const selectedOptions = Array.from(teamsSelect.selectedOptions);
          
            // Ensure exactly two teams are selected
            if (selectedOptions.length === 2) {
              // Extract team IDs from the selected options
              const team1Id = parseInt(selectedOptions[0].value, 10);
              const team2Id = parseInt(selectedOptions[1].value, 10);
          
              // Log or perform actions with the selected team IDs
              console.log("Selected Team 1 ID:", team1Id);
              const team1: TeamProps | undefined = teams.find((team: TeamProps) => team.teamid === team1Id) ; 
              const team2: TeamProps | undefined  = teams.find((team: TeamProps) => team.teamid === team2Id) ; 
              if(team1 && team2 && leagueCtx.league.leagueid && selectedDivision && isValidDate(scheduleDate)) {
                const scheduledMatch: ScheduleProps | undefined = createMatch(tempMatchId, scheduleDate, team1, team2, leagueCtx.league.leagueid, selectedDivision.divisionid, 0, 0 ) ;
                tempMatchId++ ; 
                console.log("Selected Team 1 name ID:", team1?.teamname) ;
                if(scheduledMatch) {
                  matches.push(scheduledMatch) ;
                  setMatches(matches) ; 
                  const newMatchOption = document.createElement("option") ;
                  newMatchOption.value = "" + scheduledMatch.scheduleid ; 
                  newMatchOption.text = team1.teamname + " vs " + team2.teamname ; 
                  matchesSelect.add(newMatchOption) ; 
                }
              }
              console.log("Matches created: ", matches.length) ; 
            } else {
              // Inform the user that they need to select exactly two teams
              console.error("Please select exactly two teams.");
            }
          console.log("--- onPairTwoTeamsButtonClick ended") ;
        }

        function onSaveSchedule() {
          console.log('--- onSaveSchedule called.') ;
          matches.forEach((match: ScheduleProps) => {
            console.log(match.leagueid, match.scheduleid, match.matchdate, match.team1, match.team2 ) ;
            saveToSupabase(match) ;
          });
          console.log("--- onSaveSchedule ended") ;
      }
      

        return (
    <div>
      <style>
        {`
          #debuggingInfoDiv {
            background-color: pink ; 
            margin-bottom: 10px ;
          }       
          #selectionsDiv {
            background-color: lightgray ; 
            width: 110% ; 
            margin-bottom: 10px ;
          }     
          #statusDiv {
            background-color: lightgreen ; 
            width: 100% ; 
            margin-top: 10px ;
          }  
          #teamsSelectionDiv {
            background-color: lightgray ; 
            width: 40% ; 
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
          #matchesSelectionDiv {
            background-color: lightgray ; 
            width: 40% ; 
            float: left ; 
          }     
          #teamsSelect {
            background-color: #E0E8F0 ; 
            width: 100% ; 
            float: left ; 
          }     
          #matchesSelect {
            background-color: #E0E8F0 ; 
            width: 100% ; 
            float: left ; 
          }     
        `}
      </style>
      <div id="debuggingInfoDiv">
        Make or Edit Schedule {time}
        <br/>
        League ID: {leagueCtx.league?.leagueid}, League day: {leagueCtx.league?.day}, League year: {leagueCtx.league?.year}
        <br/>
        <SchedulingSetup divisionHandler={divisionHandler} divisionid={selectedDivision.divisionid} dateHandler={dateHandler} scheduleDate={scheduleDate} allDivisions={divisions} />
        <br/>
        <p>
        League ID: {leagueCtx.league?.leagueid}, League day: {leagueCtx.league?.day} 
        <br/>
        Division Name: {selectedDivision.divisionname}, Division ID; {selectedDivision.divisionid}
        <br/>
        Date being scheduled: {scheduleDate} {warningMessage} 
        </p>
      </div>
      <div id="selectionsDiv" >
        <div id="teamsSelectionDiv">
          <div>
            <label>Select 2 teams to play each other</label>
          </div>
          <select id="teamsSelect" size={20} multiple={true} > 
          {teams.map((team) => (
            <option key={team.teamid} value={team.teamid}>{team.teamname}</option> 
          ))}
          {teams.map((team) => (
            <option key={team.teamid} value={team.teamid}>{team.teamname}</option> 
          ))}
          </select>
        </div>
        <div id="buttonColumnDiv">
          <div>
            <button className="m-4 p-4 bg-blue-200 font-bold rounded-lg" onClick={onPairTwoTeamsButtonClick} >
		          → 
	          </button>
          </div>
          <div>
            <button className="m-4 p-4 bg-blue-200 font-bold rounded-lg" onClick={onMakeASchedule} >
		          ← 
	          </button>
          </div>
          <button className="m-4 p-4 bg-blue-200 font-bold rounded-lg" onClick={onSaveSchedule} >
            Save
	        </button>
          <div>
            <br/>
            <Link
                className=" m-4 p-4 bg-red-200 font-bold rounded-lg text-black-800 transition hover:text-blue-800/75"
                href="/admin"
              >
                Cancel
              </Link>
          </div>
        </div>
        <div id="matchesSelectionDiv" > 
          <div>
            <label>Matches scheduled so far</label>
          </div>
          <select id="matchesSelect" size={20} multiple={true}> 
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

  function onMakeASchedule() {
    time = '10:51' ; 
    console.log('onMakeASchedule called.') ;
  }

}


