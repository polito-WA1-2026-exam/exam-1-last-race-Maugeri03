// Header components

import { useContext } from "react"
import { Navbar, Container, Button } from "react-bootstrap"
import { Controller } from "react-bootstrap-icons"
import { useNavigate } from "react-router"
import { useLocation } from 'react-router';

import UserContext from "../contexts/UserContext"
import {LogoutButton} from "./LoginForm.jsx"

function Header(props) {
    const userContext = useContext(UserContext);
    const location = useLocation();


    return (
        <Navbar className="bg-primary">
            <Container className="justify-content-between">
                <Title />
                {(!userContext.user.id && location.pathname != "/login") && <LoginButton isWaiting={props.isWaitingLog} />}
                {userContext.user.id && <LogoutContext />}
            </Container>
        </Navbar>

    )
}

function Title(props) {
    const navigate = useNavigate();
    const toHome = () => {
        navigate("/");
    };

    return <>
        <Navbar.Brand className="text-white fs-5 clickable" onClick={toHome}>Last Race <Controller size={30} /></Navbar.Brand>
    </>
}


function LoginButton(props) {
    const navigate = useNavigate();
    const toLogin = () => {
        navigate("/login");
    }

    return <>
        <Button className="primary fs-5" disabled={props.isWaiting} onClick={toLogin} >Login</Button>
    </>
}


function LogoutContext(props) {
    const userContext = useContext(UserContext);
    const location = useLocation();

    return (
        <div className="d-flex justify-content-center align-items-center col-3 gap-5">
            <p className="fs-5 text-white m-0">Hello, {userContext.user.username}</p>
            { location.pathname == "/" && <LogoutButton />}
        </div>);

}


export default Header;