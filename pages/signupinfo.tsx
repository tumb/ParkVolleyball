/* eslint-disable react/no-unescaped-entities */
import React from "react";

export default function signupinfo() {
  return (
    <div className="flex flex-col items-start justify-center p-4 space-y-4 text-gray-800">
      <div className="text-sm space-y-4">
        <h2 className="text-2xl font-semibold">Signup Information</h2>
        <ul className="list-disc px-4">
          <li>
            Location is Buffalo's Delaware Park. Within the park, we play just
            south of Hoyt Lake. This is outdoors - not a gym or bubble.
          </li>
          <li>We start the first week of June weather permitting.</li>
          <li>We end in late August</li>
          <li>Cost is $20 per person ($40 per team)</li>
          <li>
            Teams play 2 matches per night. Plan to be there from 6 til 8:30ish.
            Unlike other leagues where you play one match and then leave.
          </li>
          <li>Teams are one man and one woman</li>
          <li>Courts are on grass. We cancel when they are wet/slippery</li>
        </ul>
      </div>

      <div className="text-sm">
        <h2 className="text-2xl font-semibold">Contact Info</h2>
        <p className="">
          Feel free to ask for more information.
          <br /> Email me at:{" "}
          <a
            href="mailto: thom.burnett@gmail.com"
            className="text-blue-700 underline"
          >
            thom.burnett@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
