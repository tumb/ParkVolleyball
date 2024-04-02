import React from "react";
import Link from "next/link";
import { useContext, useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import {PlayerProps } from "@/lib/types" ;
import { getCurrentFormattedDate } from "@/components/admin/scheduling_functions/SchedulingUI";
// import '@/styles/layouts.css' ; Not allowed to add a global style sheet. I put this into ./pages/_app.tsx but don't know that I'll use it. 

export default function AddPlayer() 
    {
        const [warningMessage, setWarningMessage] = useState("") ;
        const [players, setPlayers] = useState<PlayerProps[]>([]) ;
        const [firstname, setFirstname] = useState( "First Name") ;
        const [lastname, setLastname] = useState( "Last Name") ;
        const [gender, setGender] = useState( "F") ;
        const [email, setEmail] = useState( "email") ;
        const [phone, setPhone] = useState( "phone") ;

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

        // Get a list of all players when the page first loads.
        useEffect(() => {
          if(players == null || players.length == 0) {
            findPlayersSearch() ; 
          }
        }
        ) ;

        async function onSavePlayer() {
          console.log('--- onSavePlayer called.') ;
          console.log("firstname: ", firstname) ;
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
              console.log("Saved player: ", firstname, " ", lastname) ;
            } 
            catch (error: any) {
            console.error("Error saving schedule:", error.message);
            }
          }
          console.log("--- onSavePlayer ended") ;
      }
      
      function validatePlayerData() {
        var isValid : boolean = true ; 
        isValid = isValid && firstname.length > 1 ;
        isValid = isValid && lastname.length > 2 ; 
        // Email validation using a regular expression
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid = isValid && (emailRegex.test(email)) ;
        return isValid ; 
      }

      const handleFirstnameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFirstname(event.target.value);
      };

      const handleLastnameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLastname(event.target.value);
      };

      const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
      };

      const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(event.target.value);
      };

      const handleGenderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log("--- handleGenderChange: ", event.target.value) ;
        setGender(event.target.value);
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
        `}
      </style>
      <div id="debuggingInfoDiv">
        Add a Player
        <p>
        <br/>
        <br/>
        </p>
      </div> {/* End of debuggingInfoDiv */}
      <div id="infoPanelsDiv" >
        <div id="newPlayerDiv">
          <div>
            <label>New Player</label>
          </div><br/>
          <div className="form-group">
            <label>First Name</label>
            <input type="text" name="firstname" id="firstname" placeholder = "First Name" onChange={handleFirstnameChange}/>
          </div>
          <br/>
          <div className="form-group">
            <label>Last Name</label><input type="text" id="lastname" name="lastname" placeholder = "Last Name" onChange={handleLastnameChange}/>
            <br/>
          </div>
          <div className="form-group">
            <label htmlFor="gender">Gender</label>
          <div className="gender-radio-group" id="gender-radio-group" onChange={handleGenderChange}> 
          <div className="gender-radio-buttons">
          <input  type="radio" name="gender" value="M"/> 
          <label htmlFor="male" >  Male   </label>
          <br/>
          <input  type="radio" name="gender" value="F"/>
          <label htmlFor="female"> Female </label>
          </div>
          </div>
          </div>
          <div className="form-group">
          <label>Email</label>
          <input type="text" id = "email" name="email" placeholder = "me@company.com" onChange={handleEmailChange}/>
          </div>
          <br/>
          <div className="form-group">
          <label>Phone</label>
          <input type="text" id="phone" name="phone" placeholder = "716 555 1234" onChange={handlePhoneChange}/>
          </div>
        </div>
        <div id="buttonColumnDiv">
          <button className="m-4 p-4 bg-green-200 font-bold rounded-lg" onClick={onSavePlayer} >
            Save
	        </button>
          <div>
            <br/>
            <Link
                className=" m-4 p-4 bg-blue-200 font-bold rounded-lg text-black-800 transition hover:text-blue-800/75"
                href="/addTeam"
              >
                AddTeam
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
        </div>
        <div id="existingPlayerDiv" > 
          <div>
            <label>Players already in database</label>
          </div>
          <select id="existingPlayerList" size={20} multiple={true}> 
          {players.map((player) => (
            <option key={player.playerid} value={player.playerid}>{player.firstname} {player.lastname}</option> 
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



