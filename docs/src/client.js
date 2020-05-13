import "@primer/css/dist/base.css";
import "@primer/css/dist/box.css";
import "@primer/css/dist/buttons.css";
import "@primer/css/dist/utilities.css";
import "@primer/css/dist/navigation.css";
import "@primer/css/dist/markdown.css";
import "@primer/css/dist/alerts.css";
import "./style.css";
import * as sapper from "@sapper/app";

sapper.start({ target: document.querySelector("#sapper") });
