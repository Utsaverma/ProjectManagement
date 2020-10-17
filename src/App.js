import React from 'react';
import './App.css';
import Login from './components/Login';
import Header from './components/Header';
import Footer from './components/Footer';
import Manager from './components/Manager';
import Lead from './components/Lead';
import Developer from './components/Developer';
import RoleRouter from './components/RoleRouter';
// import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom'; 

function App() {
  return (
      <div className="App">
        <Header/>
        {/* <Router> 
          <Switch> 
            <Route exact path='/' component={Login}></Route> 
            <Route exact path='/managerProfile' component={Manager}></Route> 
            <Route exact path='/developerProfile' component={Developer}></Route>
            <Route exact path='/leadProfile' component={Lead}></Route>  
          </Switch>  
        </Router>  */}
        <Login/>
        {/* <RoleRouter/> */}
        <Footer/>
      </div>
  );
}

export default App;
