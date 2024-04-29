import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import CreateProject from './components/CreateProject';
import Logout from './components/Logout';
import MenuBar from './components/MenuBar';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
        <div className='App'>
          <MenuBar/>
        </div>
  );
}

export default App;
