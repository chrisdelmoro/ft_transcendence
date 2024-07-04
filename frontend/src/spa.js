async function loadEnv() {
    try {
        const response = await fetch('../.env');
        const text = await response.text();
        window.env = text.split('\n').reduce((acc, line) => {
            const [key, value] = line.split('=');
            if (key && value) {
                acc[key.trim()] = value.trim();
            }
            return acc;
        }, {});
    } catch (err) {
        console.error("Erro ao tentar ler o arquivo .env", err);
    }
}

import Home from './pages/Home/index.js';
import Loading from './pages/Loading/index.js';
import Login from './pages/Login/index.js';
import PageGame from './pages/PongGame/index.js';
import SingUp from './pages/SingUp/index.js';
import authProvider from './provider/authProvider.js';
import PvPage from './pages/Pvp/index.js';
import Tournament from './pages/Tournament/index.js';
import VsAI from './pages/VsAI/index.js';
import Profile from './pages/ProfilePage/index.js';

async function route(path) {
    const routes = {
        "/": new Login("#app"),
        "": new Login("#app"),
        "/profile": new Profile("#app"),
        "/game": new PageGame("#app"),
        "/register": new SingUp('#app'),
        "/home": new Home("#app"),
        "/pvp": new PvPage("#app"),
        "/tournament": new Tournament("#app"),
        "/vsai": new VsAI("#app"),
    }
    if (path === "" || path === "/" || path === "/register")  {
        return routes[path]
    }
    return await securityRoutes(routes[path])
}

async function securityRoutes(componet) {
    const loading = new Loading("#app");
    loading.reRender();
    const res = await authProvider.isAuthenticated()
    if (res) {
        return componet
    } else {
        window.history.pushState({}, '', '/'); 
        return new Login("#app")
    }
}

 const render = async () => {
    const path = window.location.pathname;
    let component = await route(path)
    if (component === undefined) {
        window.history.pushState({}, '', '/'); 
        component = route("/")
    }
    component.reRender();
    document.querySelectorAll('a').forEach(anchor => {
        anchor.addEventListener('click', (event) => {
            event.preventDefault();
            const href = event.currentTarget.getAttribute('href');
            window.history.pushState({}, '', href);
            render();
        });
    });
};

const navigateTo = (url) => {
    if (window.location.pathname !== url) {
        window.history.pushState({}, '', url);
        render();
    }
};

window.navigateTo = navigateTo;

document.addEventListener('DOMContentLoaded', async () => {
    await loadEnv();
    render();
    window.addEventListener('popstate', render);
    window.addEventListener('beforeunload', async () => {
        const token = authProvider.get().token;
        if (token === undefined) {
            return
        }
       authProvider.changeStatus("offline")
    });
});



