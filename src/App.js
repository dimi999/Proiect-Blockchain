import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import CreateProject from './components/CreateProject';
import Logout from './components/Logout';
import MenuBar from './components/MenuBar';
import { Container } from 'react-bootstrap';

function App() {
  return (
    <Container>
      <Router>
        <Routes>
          <Route exact path="/" element={Home} />
          <Route path="/create-project" element={CreateProject} />
          <Route path="/logout" element={Logout} />
        </Routes>
      </Router>
      <MenuBar></MenuBar>
    </Container>
  );
}

export default App;
