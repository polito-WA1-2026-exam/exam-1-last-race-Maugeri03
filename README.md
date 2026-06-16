# Exam #1: "Last Race"
## Student: s358318 Maugeri Davide 

## React Client Application Routes
- Route `/`: shows game instructions and the complete underground map. It offers the possibility to login in, logout, see the best scores and start a new game. 
- Route `/login`: shows the login form.
- Route `/best-scores`: shows the global ranking.
- Route `/game`: allows users to play the game and to compute a solution. It shows: a timer, the initial and final station, the underground map with only the stations and all the possible segments. 
- Route `/game-solution`: shows if the proposed solution is correct or not. In affermative case, it displays the solution with the events and its effects, otherwise, it display a valid solution. It offers the possibility to start a new game.



## API Server

### Game
GET `/api/game/underground`
- Auth: user identified via passport session
- Request body: none
- Response body: 
  ```
  {
    stations: [...],
    lines: [...],
    segments: [...]
  }
  ```
- Code: `200 OK`, `401 Unauthorized`, `500 Internal Server Error`

POST `api/game/start`
- Auth: user identified via passport session
- Request body: none
- Response body: 
  ```
  {
    departure:
    arrival:
    timeLimit:
  }
  ```
- Code: `200 OK`, `401 Unauthorized`, `409 Conflict`, `500 Internal Server Error`

POST `api/game/submit`
- Auth: user identified via passport session
- Request body:
   ```
  {
    segmentsId: [...]
  }
  ```
- Response body: 
  ```
  {
    valid:
    coins:
    events:
    possibleSolution:
  }
  ```
- Code: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`


GET `/api/best-scores`
- Auth: user identified via passport session
- Request body: none
- Response body: 
  ```
  {
    usernames: [...],
    scores: [...]
  }
  ```
- Code: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `500 Internal Server Error`

### Session
POST `/api/sessions`
- Request body:
  ```
  {
    email:
    password:
  }
  ```
- Response body: none
- Code: `200 OK`, `401 Unauthorized`, `500 Internal Server Error`  

GET `/api/sessions/current`
- request body: none
- response body:
  ```
  {
    id:
    username:
    email:
    best_score:
  }
  ```
- Code: `200 OK`, `401 Unauthorized`, `500 Internal Server Error`

DELETE `/api/sessions/current`
  - request body: none
  - response body: none
  - code: `200 OK`,  `401 Unauthorized`, `500 Internal Server Error` 


## Database Tables

- Table `users` - contains id, email, username, best_score, hashed_password, salt
- Table `stations` - contains id, name, station_x, station_y, name_x, name_y
- Table `lines` - contains id, name, color
- Table `segments` - contains id, id_station1, id_station2, id_line
- Table `events` - contains id, description, effect

## Data Models
### Underground
```
{
  stations: [...],
  lines: [...],
  segments: [...]
}
```
## Main React Components
- `LoginForm` (in `LoginForm.js`): allows user to log in.
- `UndergroundMap` (in `Game.js`): shows the underground map.
- `SegmentList` (in `Game.js`): shows the list of all the possible segments.
- `SegmentCard` (in `Game.js`): shows a single segment. It is used to compute the solution. 
 - `EventList` (in `Game.js`): shows all the events that affetc a valid solution. 
- `Ranking` (in `Ranking.js`): shows the global ranking.  


## Screenshot

![Screenshot](./img/screenshot.jpg)

## Users Credentials

- username, password (plus any other requested info)
- username, password (plus any other requested info)

## Use of AI Tools
Briefly describe whether you used any AI tools (e.g., ChatGPT, GitHub Copilot, Claude) while working on this project, for which purposes (e.g., clarifying concepts, debugging, generating code), and how you verified or adapted their output.
If you did not use any AI tools, simply state so.
