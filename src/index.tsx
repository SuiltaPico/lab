/* @refresh reload */
import { render } from "solid-js/web";
import { Route, Router, Routes } from "@solidjs/router";
import App from "./App";
import NotFound from "./components/pages/NotFound";
import { DTransform } from "./components/pages/app/DTransform";
import "./index.css";

const root = document.getElementById("root")!;

render(
  () => (
    <Router>
      <Routes>
        <Route path="/" component={App} />
        <Route path="/DTransform" component={DTransform}></Route>
        <Route path="/*" component={NotFound} />
      </Routes>
    </Router>
  ),
  root,
);
