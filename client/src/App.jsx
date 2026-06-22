import { useContext, useEffect, useState } from 'react';
import { Outlet, Routes, Route, useNavigate, useLocation } from 'react-router';
import { Container, Row, Col, Spinner } from "react-bootstrap"

import './App.css';

import UserContext from "./contexts/UserContext.js";
import UndergroundContext from './contexts/UndergroundContext.js';

import AUTH from './api/auth.js';
import API from "./api/api.js"

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import { LoginForm } from "./components/LoginForm.jsx"
import { GameInstruction, GameMap, GameStartButton, GameSession, GameResult } from "./components/Game.jsx"
import { RankingDisplay, RankingButton } from "./components/Ranking.jsx"
import BannerError from './components/BannerError.jsx';


function App() {
  //Navigate
  const navigate = useNavigate();

  //User state + isWaitingLog
  const [user, setUser] = useState({ email: undefined, username: undefined, best_score: undefined, id: undefined });
  const [isWaitingLog, setIsWaitingLog] = useState(true);

  //Underground map
  const [underground, setUnderground] = useState({ stations: undefined, lines: undefined, segments: undefined });

  //UseEffect for checking if there is already a valid session
  useEffect(() => {
    async function getSession() {
      try {
        const res = await AUTH.getSession();
        if (res !== undefined) {
          setUser({ email: res.email, username: res.username, best_score: res.best_score, id: res.id });
        }
      }
      catch (err) {
        navigate("/error", {state:err});
      }
      finally {
        setIsWaitingLog(false);
      }
    };
    getSession();
  }, []);


  //UseEffect for retrieving the underground object
  useEffect(() => {
    async function getUnderground() {
      if (user.id === undefined) return;
      try {
        //Case: user logged in
        const res = await API.getUnderground();
        setUnderground({ stations: res.stations, lines: res.lines, segments: res.segments });
      }
      catch (err) {
        navigate("/error", {state:err});
      }
    };
    getUnderground();
  }, [user.id, navigate]);

  return (<>
    <UserContext value={{ user: user, setUser: setUser }}>
      <UndergroundContext value={underground}>
        <Routes>
          <Route path="/" element={<PageLayout isWaitingLog={isWaitingLog} />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginForm />} />
            <Route path="game" element={<GameSession />} />
            <Route path="game-solution" element={<GameResult />} />
            <Route path="ranking" element={<RankingDisplay />} />
            <Route path="error" element={<PageError/>}/>
            <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
      </UndergroundContext>
    </UserContext>
  </>)
}


function PageLayout(props) {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header isWaitingLog={props.isWaitingLog} />
      <MainComponent />
      <Footer />
    </div>)
}


function MainComponent(props) {
  return (
    <Container className="flex-grow-1">
      <Outlet />
    </Container>
  )
}


function HomePage(props) {
  const userContext = useContext(UserContext);

  return <>
    {(!userContext.user.id) && <GameInstruction />}
    {(userContext.user.id) && <StartGamePage />}
  </>
}


function StartGamePage(props) {
  const underground = useContext(UndergroundContext);

  return <>
    <Row className='align-items-center'>
      {/* Instructions */}
      <Col className='col-6'>
        <GameInstruction />
      </Col>
      {/* Underground map + button for starting the game */}
      <Col className={"col-6 my-3 d-flex flex-column justify-content-center align-items-center"}>
        {/* Case: loaded map */}
        {underground.stations !== undefined && <div className='map border rounded' ><GameMap /></div>}
        {underground.stations !== undefined && <div className='d-flex justify-content-center gap-5 mt-4'>
          <div className='col-6 d-grid'><GameStartButton /></div>
          <div className='col-6 d-grid'><RankingButton /></div>
        </div>}
        {/* Case> unloaded map */}
        {underground.stations === undefined && <Spinner variant="primary" animation="border" className="big-spinner" />}

      </Col>
    </Row>
  </>
}


function PageError(props){
  const location = useLocation();
  const errorData = location.state;

  return(
    <BannerError httpError={errorData.httpCode} message={errorData.message}/>
  );

}


function PageNotFound(props) {
  return <>
    <h3 className="text-center mt-5">Page not found</h3>
  </>
}

export default App
