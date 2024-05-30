/* eslint-disable react/no-unescaped-entities */
import React from "react";

export default function signupinfo() {
  return (
    <div className="flex flex-col items-start justify-center p-4 space-y-4 text-gray-800">
      <div className="text-sm space-y-4">
        <h2 className="text-2xl font-semibold">Are you sure you want to sign up? </h2>
        <ul className="list-disc px-4">
          <li>
            Location is Buffalo's Delaware Park. Within the park, we play just
            south of Hoyt Lake. This is outdoors - not a gym or bubble.
          </li>
          <li>We start the first week of June weather permitting.</li>
          <li>We end in late August</li>
          <li>
            Teams play 2 matches per night. Plan to be there from 6 til 8:30ish.
            Unlike other leagues where you play one match and then leave.
          </li>
          <li>Teams are one man and one woman</li>
          <li>Courts are on grass. We cancel when they are wet/slippery</li>
          <li>Cost is $20 per person ($40 per team)</li>
        </ul>
      </div>
      <div className="text-sm space-y-4">
        <h2 className="text-2xl font-semibold">Signup Information</h2>
        <ul className="list-disc px-4">
          <li> 
            What teams are playing will be decided in April of the year. You can state an interest any time before then. 
          </li>
          <li> New teams can put themselves on the list anytime before mid-April by sending an email to me. Don't count on my memory or a phone call. </li>
          <li> Returning teams who want to play must confirm by mid-April. New teams are considered after that. </li>
          <li> To be a team (not just interested) on any list, you must give your name, email address, and your partner's name. </li>
          <li> Until you've named a partner you are not a team.           </li>
          <li>Currently Thursdays pay goes to Jonathan Hall. Venmo is @JonathanHallAuburn Phone last 4 is 6678</li>
          <li>Currently Mondays pay goes to Angela Omilian. Venmo is @angelaomilian Last 4 digits are 7497</li>

        </ul>
      </div>

      <div className="text-sm">
        <h2 className="text-2xl font-semibold">Contact Info</h2>
        <p className="">
          Feel free to ask for more information.
          <br /> Email me at:{" "}
          <a
            href="mailto: Delawareparkvball@gmail.com."
            className="text-blue-700 underline"
          >
            Delawareparkvball@gmail.com
            <br/>
          </a>
        </p>
      </div>
    </div>
  );
}
