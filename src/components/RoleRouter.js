import React from 'react';
import Manager from './Manager';
import Lead from './Lead';
import Developer from './Developer';
import ErrorScreen from './ErrorScreen';
import Config from '../assets/config.json';


class RoleRouter extends React.Component {
    constructor(props){
        super(props);
        this.state={
          name:"UnauthorizedUser",
          role:"NA"
        }
    }
    
    //To logout
    logOut=()=>{
      window.location.reload();
    }
    render() {
      return <React.Fragment>
            <div className="userContainer">
              <div className="userName">
                Welcome , <i className="fa fa-user" aria-hidden="true"></i> <span>{this.props.data["name"]}</span> ({this.props.data["role"]})
              </div>   
              <div className="logout" onClick={()=>this.logOut()}>
                <i className="fa fa-sign-out" aria-hidden="true"></i>LogOut
              </div>
            </div>
          <div className="roleContainer">{
            this.props.data["roleId"]==1?
            <Manager data={this.props.data}/>:this.props.data["roleId"]==2?
                <Lead data={this.props.data}/>:this.props.data["roleId"]==3?
                    <Developer data={this.props.data}/>:this.props.data["roleId"]?<ErrorScreen errMsg={Config.roleErr}/>:null
          }
          </div>
      </React.Fragment>
    }
  }

export default RoleRouter;