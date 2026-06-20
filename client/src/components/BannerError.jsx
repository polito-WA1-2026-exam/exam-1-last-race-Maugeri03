// Banner for showing the errors

import { Row, Col, Alert } from "react-bootstrap";
import { ExclamationCircleFill } from "react-bootstrap-icons";

function BannerError(props){
     return (
        <Row className="justify-content-center text-center mt-4">
            <Col className="col-3">
                <Alert variant="danger"><ExclamationCircleFill size={30} className="me-2"/>{props.httpCode} {props.message}</Alert>
            </Col>
        </Row>
    )
};

export default BannerError;