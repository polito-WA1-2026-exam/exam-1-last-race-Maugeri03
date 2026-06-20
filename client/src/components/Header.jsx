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
            <Container>
                <Title />
                {(!userContext.user.id && location.pathname != "/login") && <LoginButton />}
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
        <Navbar.Brand className="text-white fs-5 clicable" onClick={toHome}>Last Race <Controller size={30} /></Navbar.Brand>
    </>
}


function LoginButton(props) {
    const navigate = useNavigate();
    const toLogin = () => {
        navigate("/login");
    }

    return <>
        <Button className="primary fs-5" onClick={toLogin} >Login</Button>
    </>
}


function LogoutContext(props) {
    const userContext = useContext(UserContext);

    return (
        <div className="d-flex justify-content-between align-items-center col-3">
            <p className="fs-5 text-white m-0">Welcome {userContext.user.username}</p>
            <LogoutButton />
        </div>);

}


export default Header;