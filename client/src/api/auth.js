// API for authentication

const SERVER_URL = "http://localhost:3001/api";

async function doLogin(email, password) {
    let result_text;
    let res
    try {
        res = await fetch(`${SERVER_URL}/sessions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: password }),
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


async function getSession() {
    let result_text;
    let res
    try {
        res = await fetch(`${SERVER_URL}/sessions/current`, {
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
        if (res.status == 500) {
            const err = new Error(`${result.message}`);
            err.httpCode = res.status;
            throw err;
        }
        else {
            return undefined;
        }
    }
}


async function doLogout() {
    let result_text;
    let res
    try {
        res = await fetch(`${SERVER_URL}/sessions/current`, {
            method: "DELETE",
            credentials: "include"
        });
        result_text = await res.text();
    }
    catch {
        throw new Error("Network Problem");
    }
    if (res.ok) {
        return true;
    }
    else {
        //Because only in case of errors there is a body
        const result = JSON.parse(result_text);
        const type = res.headers.get("Content-Type");
        if (type === undefined || !type.includes("application/json")) {
            throw new Error(`Expected application/json, got type ${type}`);
        }
        const err = new Error(`${result.message}`);
        err.httpCode = res.status;
        throw err;
    }
};

const AUTH = {doLogin, getSession, doLogout};
export default AUTH;