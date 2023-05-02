const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
let db = null;
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

const initialize = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server started");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};

initialize();

app.get("/players/", async (request, response) => {
  const playerQuery = `
        SELECT 
        player_id as playerId,
        player_name as playerName
        from player_details;
    `;
  const dbResponse = await db.all(playerQuery);
  response.send(dbResponse);
});

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `
        SELECT 
        player_id as playerId,
        player_name as playerName
        from player_details
        where player_id='${playerId}';
    `;
  const dbResponse = await db.get(playerQuery);
  response.send(dbResponse);
});

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const playerQuery = `
        update player_details
        set
        player_name='${playerName}'
        where player_id='${playerId}';
    `;
  const dbResponse = await db.run(playerQuery);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId", async (request, response) => {
  const { matchId } = request.params;
  const playerQuery = `
        select 
        match_id as matchId,
        match,
        year
        from 
        match_details
        where match_id='${matchId}';
    `;
  const dbResponse = await db.get(playerQuery);
  response.send(dbResponse);
});

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `
        select 
        match_id as matchId,
        match as match,
        year as year
        from 
        player_match_score natural join match_details
        where player_id='${playerId}';
    `;
  const dbResponse = await db.all(playerQuery);
  response.send(dbResponse);
});

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const playerQuery = `
        select 
        player_id as playerId,
        player_name as playerName
        from 
        match_details natural join player_match_score as t natural join player_details
        where match_id='${matchId}';
    `;
  const dbResponse = await db.all(playerQuery);
  response.send(dbResponse);
});

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `
    SELECT
   player_id as playerId,
   player_name as playerName,
   sum(score) as totalScore,
   sum(fours) as totalFours,
   sum(sixes) as totalSixes
   from
   player_match_score natural join match_details as t natural join player_details
   where player_id like ${playerId}
    `;

  const dbResponse = await db.get(playerQuery);
  response.send(dbResponse);
});

module.exports = app;
