import React from "react";
import Link from "next/link";
import { useContext, useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import {PlayerProps, emptyPlayer } from "@/lib/types" ;
import { getCurrentFormattedDate, findSelectedPlayer } from "@/components/admin/scheduling_functions/SchedulingUI";
import { deletePlayerFromSupabase } from "@/components/database/deletes";
import { updatePlayerInfo } from "@/components/database/savesOrModifications";
// import '@/styles/layouts.css' ; Not allowed to add a global style sheet. I put this into ./pages/_app.tsx but don't know that I'll use it. 

export default function AddPlayer() 
    {
        const [successMessage, setSuccessMessage] = useState("No message") ;
        const [warningMessage, setWarningMessage] = useState("No message") ;
        const [errorMessage, setErrorMessage] = useState("No message") ;
        const [players, setPlayers] = useState<PlayerProps[]>([]) ;
        const [existingPlayer, setExistingPlayer] = useState<PlayerProps>(emptyPlayer) ; 
        const [playerid, setPlayerid] = useState( 0) ;
        const [firstname, setFirstname] = useState( "First Name") ;
        const [lastname, setLastname] = useState( "Last Name") ;
        const [gender, setGender] = useState( "F") ;
        const [email, setEmail] = useState( "email") ;
        const [phone, setPhone] = useState( "phone") ;

    function clearMessages() {
      setSuccessMessage("No success message.") ;
      setWarningMessage("No warning message.") ; 
      setErrorMessage("No error message.") ; 
    }

    function checkIsADuplicate() {
      const dupes = players.filter(player => player.firstname === firstname) ; 
      if(dupes.length == 0) {
        return false ; 
      }
      else {
        const lasts = dupes.filter(player => player.lastname === lastname) ;
        return lasts.length > 0 ;  
      }
    }

    const findPlayersSearch = async () => {
          console.log("--- Started findPlayersSearch. ") ;
          try {
            const { data: playerData, error } = await supabase
              .from("player")
              .select().order("lastname", {ascending: true})
        
            if (error) {
              throw error;
            }
            setPlayers(playerData as PlayerProps[] || []); 
          } catch (error: any) {
            console.error("Error fetching players:" + error);
          }
        };

        function deletePlayerFromDatabase() {
            console.log('--- deletePlayerFromDatabase called.') ;
                deletePlayerFromSupabase(existingPlayer) ;
                let playerName = existingPlayer.firstname + " " + existingPlayer.lastname ; 
                const remainingPlayers = players.filter(player2 => existingPlayer.playerid !== player2.playerid ) ; 
                setPlayers(remainingPlayers) ;
                // setCheckSavedMatches(checkSavedMatches + 1) ; This may be wanted to rerender the list
                clearMessages() ; 
                setSuccessMessage("Deleted " + playerName) ;
        }

        // Get a list of all players when the page first loads.
        useEffect(() => {
          if(players == null || players.length == 0) {
            findPlayersSearch() ; 
          }
        } ) ;

        async function onSavePlayer() {
          console.log('--- onSavePlayer called.') ;
          console.log("firstname: ", firstname) ;
          if(checkIsADuplicate()) {
            setWarningMessage("Player " + firstname + " " + lastname + " is already in the database")  ; 
            return 
          }
          if(validatePlayerData()) {
            const date = getCurrentFormattedDate() ; 
            const elo = 1500 ; 
            const player: PlayerProps = {firstname: firstname, lastname: lastname, gender: gender, email: email, phone: phone, elo: elo, entrydate: date, playerid: 0 } ;
            // Omit the scheduleid property from the schedule object
            const { playerid, ...playerWithoutId } = player;
            try {
            const { data, error } = await supabase
              .from("player")
              .insert([playerWithoutId]);
              clearMessages() ; 
              setSuccessMessage("Saved player: " + firstname + " " + lastname) ; 
              console.log("Saved player: ", firstname, " ", lastname) ;
            } 
            catch (error: any) {
              clearMessages() ;
              setErrorMessage("Failed to save player: " + firstname) ;
              console.error("Error saving player:", error.message);
            }
          }
          else {
            clearMessages() ;
            setErrorMessage("Unable to save " + firstname + ". Invalid inputs.") ;
          }
          console.log("--- onSavePlayer ended") ;
      }
      
      function onSelectExistingPlayer(value: string) {
        console.log("player id as string: ", value) ;
        const playerId = Number(value) ; 
        const player = findSelectedPlayer(playerId, players) ; 
        console.log("player: ", player) ;

        if(player) {
          setExistingPlayer(player) ; 
          setPlayerid(player.playerid) ; 
          setFirstname(player.firstname) ; 
          setLastname(player.lastname) ; 
          setGender(player.gender) ; 
          setPhone(player.phone) ; 
          setEmail(player.email) ; 
        }
        console.log("player (existing)", player) ;
      }

      async function updatePlayerInDatabase() {
        clearMessages() ; 
        if(! validatePlayerData()) {
          setErrorMessage("Invalid player data. Check all fields") ; 
          return ; 
        }
        else {
          const date = getCurrentFormattedDate() ; 
          const elo = 1500 ; 
          const player: PlayerProps = {
              firstname: firstname, lastname: lastname, gender: gender, email: email, phone: phone, 
              elo: elo, entrydate: date, playerid: playerid } ;
          // Omit the scheduleid property from the schedule object
        try {
          const resultMessage = await updatePlayerInfo(player) ; 
          if(resultMessage.includes("failed")) {
            setErrorMessage(resultMessage) ; 
          }
          else {
            setSuccessMessage(resultMessage) ;
          }
      } 
      catch (error: any) {
        // Do nothing. Error already passed in.
      }
        }
      }

      function validatePlayerData() {
        var isValid : boolean = true ; 
        isValid = isValid && firstname.length > 1 ;
        isValid = isValid && lastname.length > 2 ; 
        console.log("validating name: ", isValid) ; 
        // Email validation using a regular expression
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid = isValid && (emailRegex.test(email)) ;
        console.log("validating email: ", isValid) ; 
        return isValid ; 
      }

      const handleFirstnameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFirstname(event.target.value.trim());

      };

      const handleLastnameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLastname(event.target.value.trim());
      };

      const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value.trim());
      };

      const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(event.target.value.trim());
      };

      const handleGenderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setGender(event.target.value) ; 
        console.log("--- handleGenderChange: ", event.target.value) ;
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
          #statusDiv {
            background-color: lightgreen ; 
            width: 100% ; 
            margin-top: 10px ;
          }     
          #newPlayerDiv {
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
          #existingPlayerDiv {
            background-color: lightgray ; 
            width: 40% ; 
            float: left ; 
          }     
          #existingPlayerList {
            background-color: #E0E8F0 ; 
            width: 100% ; 
            float: left ; 
          }     
          .form-group {
            display: flex ; 
            flex-direction: row ; 
            align-items: center ; 
            margin-right: 20px;
          }
          .form-group label {
            width: 150px ; 
            margin-bottom: 5px;
            padding: 20px;
          }
          .form-group input,
          .form-group select {
            width: 150px ; 
            padding: 8px;
            border: solid ; 
          }
          .gender-radio-group {
            display: flex;
            align-items: center;
          }
          .gender-radio-buttons label {
            margin-right: 10px;
          }
          .gender-radio-group input {
            margin-right: 5px;
            width: 20px;
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
        `}
      </style>
      <div id="debuggingInfoDiv">
        Add or Edit a Player: Firstname {firstname}, Last name {lastname}, Gender {gender}, Email {email}, phone {phone}
        <br/>
        Modify or remove a player: {existingPlayer.firstname} {existingPlayer.lastname} {existingPlayer.email}
        <br/>
      </div> {/* End of debuggingInfoDiv */}
      <div id="infoPanelsDiv" >
        <div id="newPlayerDiv">
          <div>
            <label>New Player</label>
          </div><br/>
          <div className="form-group">
            <label>First Name</label>
            <input type="text" name="firstname" id="firstname" placeholder = "First Name" value={firstname} onChange={handleFirstnameChange}/>
          </div>
          <br/>
          <div className="form-group">
            <label>Last Name</label><input type="text" id="lastname" name="lastname" placeholder = "Last Name" value={lastname} onChange={handleLastnameChange}/>
            <br/>
          </div>
          <div className="form-group">
            <label htmlFor="gender">Gender</label>
          <div className="gender-radio-group" id="gender-radio-group" onChange={handleGenderChange}> 
          <div className="gender-radio-buttons">
          <input  type="radio" name="gender" checked = {gender === 'M'} value="M" /> 
          <label htmlFor="male" >  Male   </label>
          <br/>
          <input  type="radio" name="gender" checked = {gender === 'F'} value="F"/>
          <label htmlFor="female"> Female </label>
          </div>
          </div>
          </div>
          <div className="form-group">
          <label>Email</label>
          <input type="text" id = "email" name="email" placeholder = "me@company.com" value={email} onChange={handleEmailChange}/>
          </div>
          <br/>
          <div className="form-group">
          <label>Phone</label>
          <input type="text" id="phone" name="phone" placeholder = "716 555 1234" value={phone} onChange={handlePhoneChange}/>
          </div>
        </div>
        <div id="buttonColumnDiv">
          <button className="m-4 p-4 bg-green-200 font-bold rounded-lg" onClick={onSavePlayer} >
            Save
	        </button>
          <div>
            <button className=" m-4 p-4 bg-blue-200 font-bold rounded-lg text-black-800 transition hover:text-blue-800/75"
               onClick={updatePlayerInDatabase} >
                Save Change
              </button>
          </div>
          <div>
            <button className=" m-4 p-4 bg-blue-200 font-bold rounded-lg text-black-800 transition hover:text-blue-800/75"
               onClick={deletePlayerFromDatabase} >
                Delete Player
              </button>
          </div>
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
        <div id="existingPlayerDiv" > 
          <div>
            <label>Players already in database</label>
          </div>
          <select id="existingPlayerList" size={20} multiple={false} onChange={(event) => onSelectExistingPlayer(event.target.value)}> 
          {players.map((player) => (
            <option key={player.playerid} value={player.playerid} >{player.firstname} {player.lastname}</option> 
          ))}
          </select>
        </div>
      </div>  
      <div id="successDiv">{successMessage}</div>
      <div id="warningDiv">{warningMessage}</div>
      <div id="errorDiv">{errorMessage}</div>
    </div>
  );

}



