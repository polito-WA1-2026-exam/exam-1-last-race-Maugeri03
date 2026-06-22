//Login and Logout componets

import { Row, Col, Button, Form, Alert, Spinner } from "react-bootstrap"
import { useState, useContext } from "react";
import AUTH from "../api/auth.js";
import UserContext from "../contexts/UserContext.js";
import { useNavigate } from "react-router";
import BannerError from "./BannerError.jsx";



function LoginForm(props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailValidity, setEmailValidity] = useState(false);
    const [passwordValidity, setPasswordValidity] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);
    const userContext = useContext(UserContext);
    const navigate = useNavigate();

    function handleReset() {
        setEmail("");
        setPassword("");
    }

    async function handleSubmit(e) {
        e.preventDefault();

        setIsSubmitted(true);
        setIsWaiting(true);
        setShowAlert(false);

        /* Check if email and password are valid */
        const isEmailValid = (email.trim() != "") && (email.includes("@"));
        const isPasswordValid = password.trim() != "";
        setEmailValidity(isEmailValid);
        setPasswordValidity(isPasswordValid);

        /* If the fields are correct the API is called */
        if (isEmailValid && isPasswordValid) {
            try {
                const res = await AUTH.doLogin(email, password);
                //Case: login done
                if (res !== undefined) {
                    userContext.setUser({ email: res.email, username: res.username, best_score: res.best_score, id: res.id });
                    navigate("/");
                }
                //Case: login failed
                else {
                    setShowAlert(true);
                }
            }
            catch (err) {
                navigate("/error", { state: err });
            }    
        }
        setIsWaiting(false);
    }


    return <>
        {/* Form */}
        <Row className="justify-content-center mt-3">
            <Col className="col-7 bg-light border rounded">
                <h2 className="text-center mt-2" >Login</h2>
                <Form onSubmit={(e) => handleSubmit(e)}>
                    {/* Email */}
                    <Form.Group className="mt-2">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="text" isInvalid={isSubmitted && !emailValidity} placeholder="" value={email} disabled={isWaiting} onChange={(e) => setEmail(e.target.value)}></Form.Control>
                        <Form.Control.Feedback type="invalid">The email must be present and valid</Form.Control.Feedback>
                    </Form.Group>
                    {/* Password */}
                    <Form.Group className="mt-2">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" isInvalid={isSubmitted && !passwordValidity} placeholder="" value={password} disabled={isWaiting} onChange={(e) => setPassword(e.target.value)}></Form.Control>
                        <Form.Control.Feedback type="invalid">The password is required</Form.Control.Feedback>
                    </Form.Group>
                    {/* Buttons */}
                    <Row className="justify-content-around mt-4 mb-3">
                        <Button variant={!isWaiting ? "primary" : "secondary"} type="submit" className="col-2" disabled={isWaiting}>{!isWaiting ? "Send" : "Sending ..."}</Button>
                        <Button variant="danger" type="reset" className="col-2" disabled={isWaiting} onClick={() => handleReset()}>Clear</Button>
                    </Row>
                </Form>
            </Col>
        </Row>

        {/* Alert - in case of wrong credentials */}
        {showAlert && <BannerError message="Wrong credentials" httpCode="" />}
    </>
}


function LogoutButton(props) {
    const [isWaiting, setIsWaiting] = useState(false);
    const userContext = useContext(UserContext);
    const navigate = useNavigate();

    async function doLogout() {
        setIsWaiting(true);
        try {
            await AUTH.doLogout();
            userContext.setUser({ email: undefined, username: undefined, best_score: undefined, id: undefined });
            navigate("/");
        }
        catch (err) {
            navigate("/error", { state: err });
        }
        setIsWaiting(false);
    }

    return <>
        {!isWaiting && <Button className="primary fs-5" onClick={doLogout}>Logout</Button>}
        {isWaiting && <Spinner variant="light" animation="border"></Spinner>}
    </>
};


export { LoginForm, LogoutButton };