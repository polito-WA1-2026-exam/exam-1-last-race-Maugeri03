// Ranking components

import { useContext, useEffect, useState } from "react";
import { Button, Row, Col, Table, Pagination, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router";
import UserContext from "../contexts/UserContext";
import API from "../api/api";



function RankingButton(props) {
    const navigate = useNavigate();

    return (
        <Button variant="success" onClick={() => navigate("/ranking")} >Global ranking</Button>
    )
};


function RankingDisplay(props) {
    const userContext = useContext(UserContext);

    return (
        <>
            {/* Title */}
            <Row className="mt-3">
                <Col className="text-center">
                    <h2>Global ranking</h2>
                    <h4>{`Your score: ${userContext.user.best_score}`}</h4>
                </Col>
            </Row>
            {/* Table */}
            <Row className="justify-content-center mt-3">
                <Col className="col-4 text-center d-flex flex-column justify-content-center">
                    <RankingTable />
                </Col>

            </Row>
        </>

    )
};


function RankingTable(props) {
    const [currentPageNumber, setCurrentPageNumber] = useState(0);
    const [currentPage, setCurrentPage] = useState([]);
    const [isWaiting, setIsWaiting] = useState(false);
    const pageSize = 10;
    const navigate = useNavigate();

    async function pageLoad(pageNumber) {
        setIsWaiting(true);
        try {
            const res = await API.getRanking((pageNumber * pageSize) + 1, (pageNumber + 1) * pageSize);
            const newPage = [];
            res.forEach(element => {
                newPage.push({ username: element.username, best_score: element.best_score });
            });
            setCurrentPage(newPage);
        }
        catch (err) {
            navigate("/error", { state: err });
        }
        finally {
            setIsWaiting(false);
        }
    };

    async function nextPageNumber() {
        await pageLoad(currentPageNumber + 1);
        setCurrentPageNumber(page => page + 1);
    };

    async function previousPageNumber() {
        await pageLoad(currentPageNumber - 1);
        setCurrentPageNumber(page => page - 1);
    };

    useEffect(() => {
        async function getFirstPage() {
            setIsWaiting(true);
            try {
                const res = await API.getRanking(1, pageSize);
                const newPage = [];
                res.forEach(element => {
                    newPage.push({ username: element.username, best_score: element.best_score });
                });
                setCurrentPage(newPage);
            }
            catch (err) {
                navigate("/error", { state: err });
            }
            finally {
                setIsWaiting(false);
            }
        };
        getFirstPage();
    }, []);

    return (<>
        {!isWaiting && <>
            <div className="ranking-table">
                <Table bordered hover>
                    {/* Header */}
                    <thead>
                        <tr>
                            <th className="bg-light">#</th>
                            <th className="bg-light">Username</th>
                            <th className="bg-light">Record</th>
                        </tr>
                    </thead>
                    {/* Body */}
                    <tbody>
                        {currentPage.map((row, i) => <RankingTableRow key={(currentPageNumber * pageSize) + 1 + i} number={(currentPageNumber * pageSize) + 1 + i} username={row.username} record={row.best_score} />)}
                    </tbody>
                </Table>
            </div>
        </>}
        {isWaiting && <div className="ranking-table d-flex justify-content-center align-items-center"><Spinner variant="primary" animation="border" className="big-spinner" /></div>}
        <RankingTablePagination stop={currentPage.length != pageSize} pageNumber={currentPageNumber} nextPageNumber={nextPageNumber} previousPageNumber={previousPageNumber} isWaiting={isWaiting} />
    </>
    );
};


function RankingTableRow(props) {
    const userContext = useContext(UserContext);
    const username = userContext.user.username;

    return (
        <tr className={username == props.username ? "table-active" : ""}>
            <td>{props.number}</td>
            <td >{props.username}</td>
            <td>{props.record}</td>
        </tr>
    )
};


function RankingTablePagination(props) {
    return (
        <div className="d-flex justify-content-center">
            <Pagination>
                <Pagination.Prev className="link-dark text-dark" onClick={props.previousPageNumber} disabled={props.isWaiting || props.pageNumber == 0} />
                <Pagination.Next className="link-dark text-dark" onClick={props.nextPageNumber} disabled={props.isWaiting || props.stop} />
            </Pagination>

        </div>
    )
};


export { RankingButton, RankingDisplay }