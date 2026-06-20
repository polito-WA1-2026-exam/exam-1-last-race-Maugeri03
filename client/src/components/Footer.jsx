// Footer components

import { Container } from "react-bootstrap"

function Footer(props){
    return(
        <footer className="bg-primary text-white">
            <Container className="d-flex flex-row">
                <p className="fs-5 mt-3 mb-3">Web Application I</p>
            </Container>
        </footer>
    )
}

export default Footer;