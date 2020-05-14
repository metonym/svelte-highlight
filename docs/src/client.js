import "@primer/css/dist/core.css";
import "@primer/css/dist/alerts.css";
import "@primer/css/dist/markdown.css";
import "./style.css";
import * as sapper from "@sapper/app";

sapper.start({ target: document.querySelector("#sapper") });
