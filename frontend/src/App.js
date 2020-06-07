import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import User from "./components/User/User";
import Support from "./components/Support/Support";

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path="/support" render={() => <Support />} />
          <Route path="/user" render={() => <User />} />
          {/* <Route path="*" component={NotFound} /> */}
        </Switch>
      </div>
    </Router>
  );
}

export default App;
