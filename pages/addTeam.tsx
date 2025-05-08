import React from "react";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PlayerProps, TeamProps, DivisionProps, emptyDivision } from "@/lib/types";
import { LeagueContext } from "@/context/LeagueContext";
import { findSelectedDivision } from "@/components/admin/scheduling_functions/SchedulingUI" ; 
import { fetchDivisionsForLeague, findTeamsForLeague } from "@/components/database/fetches";
import { deleteTeamFromSupabase } from "@/components/database/deletes";
import { saveTeamsToDatabase, updateTeamInfo } from "@/components/database/savesOrModifications";

// import '@/styles/layouts.css' ; Not allowed to add a global style sheet. I put this into ./pages/_app.tsx but don't know that I'll use it. 



export default function AddTeam() {
	const [warningMessage, setWarningMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [men, setMen] = useState<PlayerProps[]>([]);
	const [women, setWomen] = useState<PlayerProps[]>([]);
	const [malePlayer, setMalePlayer] = useState<PlayerProps>(); // May need to put in a default player for this. 
	const [femalePlayer, setFemalePlayer] = useState<PlayerProps>();
	const [teamName, setTeamName] = useState("teamName");
	const [selectedDivision, setSelectedDivision] = useState(emptyDivision) ; 
	const [allDivisions, setAllDivisions] = useState<DivisionProps[]>([]) ;
	const [teamsBuilt,  setTeamsBuilt]    = useState<TeamProps[]>([]) ;
	const leagueCtx = useContext(LeagueContext);
	const [tempTeamId, setTempTeamId] = useState(-1) ; // This will start at -1 and go more negative so that each temp has a unique id. 

    function clearMessages() {
		setSuccessMessage("No success message.") ;
		setWarningMessage("No warning message.") ; 
		setErrorMessage("No error message.") ; 
	  }
  
	  const findPlayersByGender = async (gender: string) => {
		// console.log("--- Started findPlayersByGender for gender: ", gender);
		try {
			const { data: playerData, error } = await supabase
				.from("player")
				.select()
				.eq("gender", gender)
				.order("lastname", { ascending: true })
			if (error) {
				console.log("Error finding players ", error.message);
				throw error;
			}
			if (gender == 'M') {
				setMen(playerData as PlayerProps[] || []);
			}
			else {
				setWomen(playerData as PlayerProps[] || []);
			}
		} catch (error: any) {
			console.error("Error fetching players:" + error);
		}
		// console.log("--- Ended findPlayersByGender. ");
	};

	function isValidTeam(team: TeamProps): boolean {
		let isValid: boolean = true ; 
		isValid = isValid && team.divisionid > 0 ; 
		isValid = isValid && team.teamid < 0 ; // Already saved in database don't resave.
		console.log("team is valid: ", isValid) ;
		return isValid ; 
	}

	function manSelected(event: React.ChangeEvent<HTMLSelectElement>) {
		const malePlayerId = parseInt(event.target.value, 10);
		const newPlayer = men.find((player) => player.playerid === malePlayerId);
		if (newPlayer != undefined && newPlayer != null) {
			setMalePlayer(newPlayer);
		}
	};

	function womanSelected(event: React.ChangeEvent<HTMLSelectElement>) {
		const femalePlayerId = parseInt(event.target.value, 10);
		const newPlayer = women.find((player) => player.playerid === femalePlayerId);
		if (newPlayer != undefined && newPlayer != null) {
			setFemalePlayer(newPlayer);
		}
	};

	function teamSelected(event: React.ChangeEvent<HTMLSelectElement>) {
		const teamId = parseInt(event.target.value, 10);
		if(teamId > -1) {
			const selectedTeam = teamsBuilt.find((team) => team.teamid === teamId);
			console.log("selectedTeam: ", selectedTeam) ; 
			if(selectedTeam) {
				setTeamName(selectedTeam.teamname) ; 
				const division = allDivisions.find((division) => division.divisionid === selectedTeam?.divisionid) ; 
				if(division) {
					setSelectedDivision(division) ; 
				}
			}
		}
	};

	function updateTeamName() {
		console.log("updateTeamName started: ") ;
		var newTeamName = femalePlayer?.firstname + "/" + malePlayer?.firstname ; 
		setTeamName(newTeamName) ; 
		const teamNameField = document.getElementById('teamNameInput') ;
		teamNameField?.setAttribute("value", newTeamName) ; 
	}

	useEffect(() => {
		updateTeamName() ; 
	}, [malePlayer, femalePlayer]);

	useEffect(() => {

	}, [warningMessage]) ; 

	const divisionHandler = (e: React.ChangeEvent<HTMLInputElement>) =>  {
		 console.log("--- Started divisionHandler ---") ; 
		 console.log("e.target.value: " + e.target.value) ;
		var divId = Number(e.currentTarget.value) ; 
		console.log("divId: ", divId) ;

		if(allDivisions) {
			const selectedDiv = findSelectedDivision(divId, allDivisions) ;
			console.log("selectedDiv: ", selectedDiv) ;
			if(selectedDiv) {
		  		setSelectedDivision(selectedDiv) ;
			}
		}
	  } 

	  async function onMakeTeamButtonClick() {
	    console.log('--- onMakeTeamButtonClick called.') ;
	    console.log("teamname: ", teamName) ; 
		if(selectedDivision.divisionid > 0 ) {
	      const team: TeamProps = {teamid: tempTeamId, teamname: teamName, 
			maleid: malePlayer?.playerid != undefined ? malePlayer?.playerid : -1 , 
			femaleid: femalePlayer?.playerid != undefined ? femalePlayer?.playerid : -1 , 
			leagueid: leagueCtx.league.leagueid != undefined ? leagueCtx.league.leagueid : -1 , 
			divisionid: selectedDivision.divisionid } ;
			setTeamsBuilt(teamsBuilt.concat(team)) ;
			setTempTeamId(tempTeamId - 1) ; 
			setWarningMessage("") ; 
		  } 
		  else {
			setWarningMessage("Division isn't set yet.") ; 
		  }
	    console.log("--- onMakeTeamButtonClick ended") ;
	}

	function onDeleteClick() {
		const teamsSelect = document.getElementById("teamsSelect") as HTMLSelectElement;
		const selectedIndex = teamsSelect.selectedIndex;
		const removeValue = teamsSelect.options[selectedIndex].value;
		if(removeValue) {
			const deleteTeamId = parseInt(removeValue, 10);
			deleteTeam(deleteTeamId) ;
			// Filter out the team to remove
  			const updatedTeams = teamsBuilt.filter((team: TeamProps) => team.teamid !== deleteTeamId);

			// Update the state with the new array of teams
  			setTeamsBuilt(updatedTeams);
		}
	}

	async function deleteTeam(teamid: number) {
		await deleteTeamFromSupabase(teamid) ;
	}

	function onSaveClick() {
		console.log("--- onSaveClick started") ; 
		const validTeams: TeamProps[] = [] ; 
		for(const team of teamsBuilt) {
			console.log("team: ", team.teamname, "team.divisionid: ", team.divisionid) ;
			if(isValidTeam(team)) {
				validTeams.push(team)
			}
		}
		try {
			saveTeamsToDatabase(validTeams) ;
			setSuccessMessage("Saved teams to database: " + validTeams.length) ;
		} catch(error:any) {
			setErrorMessage(error.message) ; 
		}

		console.log("--- onSaveClick ended") ; 
	} ;

	async function onUpdateClick() {
		console.log("--- onUpdateClick started") ; 
		const teamsSelect = document.getElementById("teamsSelect") as HTMLSelectElement;
		const selectedIndex = teamsSelect.selectedIndex;
		const idOfTeamToUpdate = parseInt(teamsSelect.options[selectedIndex].value, 10);
		console.log("idOfTeamToUpdate: ", idOfTeamToUpdate) ;
		var updatingTeam = teamsBuilt.find((team) => team.teamid === idOfTeamToUpdate) ; 
		if(updatingTeam) {
			const teamNameField = document.getElementById('teamNameInput') as HTMLInputElement ;
			const newTeamName = teamNameField.value ; 
			updatingTeam.teamname = newTeamName ; 
			updatingTeam.divisionid = selectedDivision.divisionid ; 
			console.log("updatingTeam: ", updatingTeam) ; 
			let resultMessage = await updateTeamInfo(updatingTeam)
			setSuccessMessage(resultMessage) ; 
		}
	}

	function onTypedTeamName(event: React.ChangeEvent<HTMLInputElement>) {
			const { name, value } = event.target;
			setTeamName(value) ; 
			console.log("onTypedTeamName") ; 
	}

	function removeTeamButtonClick() {
		console.log("--- started removeTeamButtonClick") ; 
		const teamsSelect = document.getElementById("teamsSelect") as HTMLSelectElement;
		const selectedIndex = teamsSelect.selectedIndex;
		const removeValue = teamsSelect.options[selectedIndex].value;
		console.log("removeValue: ", removeValue) ;
		if(removeValue) {
			const removeTeamId = parseInt(removeValue, 10);
			console.log("removeTeamId: ", removeTeamId)
			// Filter out the team to remove
  			const updatedTeams = teamsBuilt.filter((team: TeamProps) => team.teamid !== removeTeamId);

			// Update the state with the new array of teams
  			setTeamsBuilt(updatedTeams);
		}
    	console.log("--- ended removeTeamButtonClick") ; 
		}

	useEffect(() => {
		// teamsSelect
	}, [teamsBuilt]);

	// Get a list of all players when the page first loads.
	useEffect(() => {
		if (men == null || men.length == 0 || women == null || women.length == 0) {
			findPlayersByGender("M");
			findPlayersByGender("F");
		}
	}, [men, women]);

	useEffect(() => {
		async function fetchExistingTeams() {
			const teams: TeamProps[] = await findTeamsForLeague(leagueCtx.league.leagueid || 0) ;
			setTeamsBuilt(teams) ;
			}
			fetchExistingTeams() ;
	}, [leagueCtx]) 

	useEffect(() => {
		console.log("--- started useEffect to set divisions after league changes. ") ;
		async function fetchDivisions() {
		const divisions: DivisionProps[] = await fetchDivisionsForLeague(leagueCtx.league?.leagueid as number) ; 
		setAllDivisions(divisions) ;
		console.log("allDivisions[0]: ", allDivisions[0]) ;
		}
		fetchDivisions()
	},[leagueCtx]) ; // eslint-disable-line react-hooks/exhaustive-deps


	return (
		<div>
			<style>
				{`
          #debuggingInfoDiv {
            background-color: pink ; 
            margin-bottom: 10px ;
          }
          #infoPanelsDiv {
			  flex; flex-direction: column;
		  }
          #extraInputsDiv {
			  display: flex ;
			  justify-content: space-between ;
			  background-color: white ; 
		  }
          #selectionsDiv {
            background-color: lightgray ; 
            width: 110% ; 
            margin-bottom: 10px ;
          }     
          #teamsSelectionDiv {
            background-color: lightgray ; 
            width: 40% ; 
            float: left ; 
            margin-left: 10px ; 
            margin-right: 5px ; 
          }    
          #buttonColumnDiv {
            float: left ; 
          } 
          .player-select{
            margin-right: 5px;
            background-color: white ; 
            width: 40% ; 
          }
          #teamNameInput {
            width: 60% ; 
            border: solid ;
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
          .inlineInputContainer {
            display: flex ;
            align-items: center ;
            margin-bottom: 5px ; 
          }
          .radio-button {
            background-color: white ; 
            padding: 10px ; 
            margin-right: 10px ;
          }
          .columnDiv {
            float: left ;
            margin-right: 10px ;  
          } 
          .bigLabel {
			  color: blue ; 
			  font-size: larger ; 
			  margin-left: 20px ; 
          } 
          .inputLabel {
			padding: 5px ; 
		} 
		.division-radio-group {
			display: flex ; 
			border: solid ; 
			height: 50px ; 
			align-items: center ; 
		}
	  `}
			</style>
			<div id="debuggingInfoDiv">
				<br/>
				League day: {leagueCtx.league?.day}, leagueid: {leagueCtx.league.leagueid}
				<br/>
				allDivisions length: {allDivisions.length} 
				<br/>
				Selected division: name {selectedDivision?.divisionname}  id {selectedDivision.divisionid} 
				<br />
				malePlayer: {malePlayer?.firstname}, femalePlayer: {femalePlayer?.firstname}, teamName: {teamName}
			</div> {/* End of debuggingInfoDiv */}
			<div id="infoPanelsDiv" >
				<div id="extraInputsDiv">
					<div>
						<div className="columnDiv">
						<label className="bigLabel">Make Teams</label>
						</div>
						<div id="teamNameDiv"  className="columnDiv">
							<label className="inputLabel">Team Name:</label>
							<input id="teamNameInput" value={teamName} onChange={onTypedTeamName}></input>
							<br />
						</div>
						<div className="inlineInputContainer">
							<label className="inputLabel">Division:</label>
							<div className="division-radio-group" id="division-radio-group">
								{allDivisions.map((division) => (
						            <label  key={division.divisionid} className="radio-button">
										<input type="radio" name="division" key={division.divisionid} 
									value={division.divisionid} checked = {selectedDivision.divisionid === division.divisionid}
									onChange={divisionHandler}/> {division.divisionname}</label>
          						))}
							</div>
							<div  style={{ marginLeft: '20px' }}> Name saved: {teamName}</div>
						</div>
					</div>
				</div>
				<div id="newTeamDiv">
					<div id="selectionsDiv" >
						<div id="teamsSelectionDiv">
							<div>
								<label>Select 2 teams to play each other</label>
							</div>
							<select id="menSelect" className="player-select" size={20} multiple={false} onChange={manSelected}  >
								{men.map((man) => (
									<option key={man.playerid} value={man.playerid}>{man.firstname} {man.lastname}</option>
								))}
							</select>
							<select id="womenSelect" className="player-select" size={20} multiple={false} onChange={womanSelected} >
								{women.map((woman) => (
									<option key={woman.playerid} value={woman.playerid}>{woman.firstname} {woman.lastname}</option>
								))}
							</select>
						</div>
						<div id="buttonColumnDiv">
							<div>
								<button className="m-2 p-4 bg-blue-200 font-bold rounded-lg"  onClick={onMakeTeamButtonClick} >
									→
								</button>
							</div>
							<div>
								<button className="m-2 p-4 bg-blue-200 font-bold rounded-lg" onClick={removeTeamButtonClick} >
									←
								</button>
							</div>
							<button className="m-2 p-4 bg-blue-200 font-bold rounded-lg" onClick={onSaveClick} >
								Save
							</button>
							<div>
							</div>
							<button className="m-2 p-4 bg-green-200 font-bold rounded-lg" onClick={onUpdateClick} >
								Update
							</button>
							<div>
							<button className="m-2 p-4 bg-purple-200 font-bold rounded-lg" onClick={onDeleteClick} >
								Delete
							</button>
							</div>
							<div>
								<br />
								<Link
									className=" m-2 p-4 bg-red-200 font-bold rounded-lg text-black-800 transition hover:text-blue-800/75"
									href="/admin"
								>
									Cancel
								</Link>
								<br />
							</div>
							<br />
						</div>
						<div id="existingTeamsDiv" >
							<div>
								<label>Existing teams and teams to be saved</label>
							</div>
							<select id="teamsSelect" className="player-select" size={20} onChange={teamSelected} >
							{teamsBuilt.map((team) => (
									<option key={team.teamid} value={team.teamid}>{team.teamname} {team.teamid}</option>
								))}
							</select>
						</div>
					</div>

				</div>
			</div>
			<div id="Status">
				<div id="errorDiv">{errorMessage}</div>
				<div id="warningDiv">{warningMessage}</div>
				<div id="successDiv">{successMessage}</div>
			</div>
		</div>
	);

}



