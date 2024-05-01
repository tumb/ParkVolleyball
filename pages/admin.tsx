import React from "react";
import Link from "next/link";


export default function admin() 
    {
    return (
      <div>
			<style>
				{`
          .link-button {
            display: inline-block;
            padding: 10px 20px; /* Adjust padding as needed */
            margin: 5px ;
            background-color: #BDF;
            border: none;
            text-decoration: none;
            font-weight: bold;
            color: #000;
            border-radius: 5px;
            width: 200px; /* Set the width as desired */
            text-align: center;          
          }
	  `}
			</style>
    <div >
        <br/>
      <div>
        <br/>
        <Link className="link-button"
              href="/makeSchedule" >
                    Make or Edit Schedule
        </Link>
      </div>
      <div>
        <Link className="link-button"
              href="/submitResults" >
                    Submit Results
        </Link>
      </div>
      <div>
        <Link className="link-button"
              href="/setDivisions" >
                    Set Divisions
        </Link>
      </div>
      <div>
        <Link className="link-button"
              href="/addTeam" >
                    Create Teams
        </Link>
      </div>
      <div>
        <Link className="link-button"
              href="/addPlayer" >
                    Add Players
        </Link>
      </div>
      <div>
        <Link className="link-button"
              href="/addLeague" >
                    Create New League
        </Link>
      </div>
    </div>
    </div>
  );
}

