import { useState } from 'react';
import { Outlet, Routes, Route } from 'react-router';
import { Container } from "react-bootstrap"

import './App.css';

import UserContext from "./contexts/UserContext.js";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import {LoginForm} from "./components/LoginForm.jsx"


function App() {
  const [user, setUser] = useState({ email: undefined, username: undefined, best_score: undefined, id: undefined });


  return (<>

    <UserContext value={{user:user, setUser: setUser}}>
      <Routes>
        <Route path="/" element={<PageLayout />}>
          <Route path="login" element={<LoginForm/>} />
          <Route path="*" element={<PageNotFound/>}/>
        </Route>
      </Routes>
    </UserContext>


  </>)
}


function PageLayout(props) {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
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


function PageNotFound(props){
  return<>
    <h3 className="text-center mt-5">Page not found</h3>
  </>
}

export default App
