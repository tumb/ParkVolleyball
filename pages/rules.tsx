import React from "react";

export default function rules() {
  return (
    <div className="flex flex-col items-start justify-center p-4 space-y-4 text-gray-800">
      <h1 className="text-3xl font-semibold">Rules</h1>

      {/* General */}
      <div className="text-sm">
        <h2 className="text-2xl">General goal:</h2>
        <p>
          This is intended to be serious fun play. We mostly follow power
          volleyball rules as handed down by USVBA, FIFA etc. and occasionally
          modify them for our added enjoyment
        </p>
      </div>

      {/* Matches */}
      <div className="text-sm">
        <h2 className="text-2xl">Matches:</h2>
        <ul className="list-disc px-4">
          <li className="">
            Each game is played to 15 points using the old fashioned scoring -
            not rally scoring.
          </li>
          <li>
            Teams play two 15 points games. That's 2 games not 2 out of 3.
          </li>
          <li>Teams play two matches per night for a total of 4 games.</li>
          <li>
            Time of matches is never stated in advance. When all 4 players of a
            game are present, we try to start that match. After that, teams that
            have been waiting should play before a given team plays twice.
          </li>
          <li>
            Each court will usually have 3 matches played on it. You will be
            working for one match and playing two for the night.
          </li>
          <li>
            When your team is not playing, you should be working - that is score
            keeping or waiting to chase after loose balls.
          </li>
        </ul>
      </div>

      {/* Play */}
      <div className="text-sm">
        <h2 className="text-2xl">Play</h2>

        <p>
          General volleyball rules apply - things like 3 hits per side with the
          block not counting. Exceptions for doubles are listed here:
        </p>

        <ul className="list-disc px-4">
          <li>
            Players may cross onto the other team's court entirely - as long as
            they don't interfere with the other team.
          </li>
          <li>
            You may not dink - that is hit the ball with the tips of your
            fingers after faking a hit. You may punch or knuckle the ball.
          </li>
          <li>
            Setting the ball over the net is not permitted. If a set goes over
            the net it's a point for the other side. Rolls, knuckles, and other
            directioning is allowed - just no fingers.
          </li>
          <li>
            Men are back line players: This means that men may never block. In
            general men must hit from 3 meters back. To be exact about that
            rule: A violation occurs when the male player has stepped on or in
            front of the 3 meter line and then contacts the ball while it is
            entirely above the top of the net. Note: This means that a tall man
            can violate the rule while standing on the ground. It also means
            that if the man jumps forward he can be above the net and quite
            close to it when he contacts the ball.
          </li>
          <li>Players may contact the net below the top tape.</li>
        </ul>
      </div>

      {/* Substitues */}
      <div className="text-sm">
        <h2 className="text-2xl">Substitutes:</h2>
        <p>
          We want to play - not to collect forfeits therefore substitutes
          (outside of playoffs) are very welcome - much better than forfeiting.
          If you know in advance that you can't play, then find a sub for
          yourself (or your team) if that doesn't work, please contact me and
          we'll probably find a sub for you. If you end up ready to play but
          without a partner, you may grab anyone of the needed gender who isn't
          playing (and isn't about to play) as a partner. People who already
          have a team and match must give complete priority to that match. Don't
          start playing as a sub if you've got a match of your own that could
          start before your subbing game finishes. This can not be allowed.
        </p>
      </div>

      {/* Playoffs */}
      <div className="text-sm">
        <h2 className="text-2xl">Playoffs:</h2>
        <ul className="list-disc px-4">
          <li>Playoffs are single elimination within your division.</li>
          <li>
            Your division is based on your record for the year. It's not where
            you finish in your last 2 weeks of the season.
          </li>
          <li>
            Generally, you will play quarter finals, semifinals and finals - as
            long as you keep winning.
          </li>
          <li>
            The quarter finals need to be finished the first week. Ideally the
            semifinals as well.
          </li>
          <li>Matches are best two of three games.</li>
          <li className="text-blue-600">
            In blue division all games are 15 points with sideout scoring.
          </li>
          <li className="text-green-600">
            In green division the 3rd game will be 25 points rally scoring.
          </li>
          <li className="text-red-600">
            In red division all games are 25 points rally scoring - to make sure
            we get to complete matches before dark.
          </li>
          <li>
            You can use a sub in the playoffs but the player has to be approved
            by me as not significantly better than your regular partner. Tell me
            before the playoff week.
          </li>
          <li>
            You also have the option of playing your match before the scheduled
            date as long as all 4 players agree. That happens a few times each
            year. It gets easier to arrange as the playoffs progress.
          </li>
          <li>
            Matches the first week have to start on time in order to finish and
            to not keep later rounds of play waiting. If I have to, I'll forfeit
            a late team a game or even a match for excessive lateness.
          </li>
        </ul>
      </div>
    </div>
  );
}
