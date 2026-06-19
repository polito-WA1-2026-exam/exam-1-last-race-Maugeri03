// API for playing the game

const SERVER_URL = "http://localhost:3001/api";

async function getUnderground(){
    let result_text;
    let res
    try {
        res = await fetch(`${SERVER_URL}/game/underground`, {
            method: "GET",
            credentials: "include"
        });
        result_text = await res.text();
    }
    catch {
        throw new Error("Network Problem");
    }
    const type = res.headers.get("Content-Type");
    if (type === undefined || !type.includes("application/json")) {
        throw new Error(`Expected application/json, got type ${type}`);
    }
    const result = JSON.parse(result_text);
    if (res.ok) {
        //Return an underground objec
        return result;
    }
    else {
        const err = new Error(`${result.message}`);
        err.httpCode = res.status;
        throw err;
    }
};


async function startGame() {
    let result_text;
    let res
    try {
        res = await fetch(`${SERVER_URL}/game/start`, {
            method: "POST",
            credentials: "include"
        });
        result_text = await res.text();
    }
    catch {
        throw new Error("Network Problem");
    }
    const type = res.headers.get("Content-Type");
    if (type === undefined || !type.includes("application/json")) {
        throw new Error(`Expected application/json, got type ${type}`);
    }
    const result = JSON.parse(result_text);
    if (res.ok) {
        return result;
    }
    else {
        const err = new Error(`${result.message}`);
        err.httpCode = res.status;
        throw err;
    }
};


async function submitSolution(solution) {
    let result_text;
    let res
    try {
        res = await fetch(`${SERVER_URL}/game/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ segmentsId:solution }),
            credentials: "include"
        });

        result_text = await res.text();
    }
    catch {
        throw new Error("Network Problem");
    }
    const type = res.headers.get("Content-Type");
    if (type === undefined || !type.includes("application/json")) {
        throw new Error(`Expected application/json, got type ${type}`);
    }
    const result = JSON.parse(result_text);
    if (res.ok) {
        return result;
    }
    else {
        const err = new Error(`${result.message}`);
        err.httpCode = res.status;
        throw err;
    }
};


async function getRanking(begin, end) {
    let result_text;
    let res
    try {
        res = await fetch(`${SERVER_URL}/best-scores?begin=${begin}&end=${end}`, {
            method: "GET",
            credentials: "include"
        });

        result_text = await res.text();
    }
    catch {
        throw new Error("Network Problem");
    }
    const type = res.headers.get("Content-Type");
    if (type === undefined || !type.includes("application/json")) {
        throw new Error(`Expected application/json, got type ${type}`);
    }
    const result = JSON.parse(result_text);
    if (res.ok) {
        return result;
    }
    else {
        const err = new Error(`${result.message}`);
        err.httpCode = res.status;
        throw err;
    }
};

const API = {getUnderground, startGame, submitSolution, getRanking};
export default API;