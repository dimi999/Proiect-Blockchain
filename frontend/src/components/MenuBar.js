import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
import Home from './Home';
import CreateProject from './CreateProject';
import Logout from './Logout';
import Profile from './Profile';
import Login from './Login';

function MenuBar() {
  return (
    <Router>
      <div>
        <Navbar bg="dark" data-bs-theme="dark">
          <Container>
            <Navbar.Brand href="/home">Navbar</Navbar.Brand>
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/home">Home</Nav.Link>
              <Nav.Link as={Link} to="/create-project">Create Project</Nav.Link>
              <Nav.Link as={Link} to="/logout">Logout</Nav.Link>
              <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
            </Nav>
          </Container>
        </Navbar>
      </div>

      <div>
        <Routes>
          <Route path="/home" element={<Home/>}/>
          <Route path="/create-project" element={<CreateProject/>}/>
          <Route path="/logout" element={<Logout/>}/>
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/" element={<Home/>}/>
          <Route path="/upload"/>
          <Route path="/updateUser"/>
          <Route path="/login" element={<Login/>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default MenuBar;