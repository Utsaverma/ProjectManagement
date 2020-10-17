import React from 'react';
import { Button, FormControl, Container , Row, Col } from "react-bootstrap";
import axios from 'axios';
import Config from '../assets/config.json';
import ErrorScreen from './ErrorScreen';
import RoleRouter from './RoleRouter';

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            serverUp:true,
            email: "",
            password:"",
            data:"",
            error:""
        };
      }
    componentDidMount(){
        axios.get(Config.basepath)
        .then(res=>{
            if(res.data=="SUCCESS"){
                this.setState({serverUp:true});
            }
            else{
                console.log("Something went wrong while connecting with BE")
                this.setState({serverUp:false});
            }
        })
        .catch(err=>{
            console.log("Something went wrong while connecting with BE")
            this.setState({serverUp:false});
        })
    }

    //Form validations
    validateForm =()=> {
        return this.state.email.length > 0 && this.state.password.length > 0;
    }

    // Handelling the login logic
    handleSubmit=(event)=> {
        event.preventDefault();
        console.log(this.state.email,this.state.password);
        let data = { 
            email:  this.state.email,
            pass:   window.btoa(this.state.password)
        };
        axios.post(Config.basepath+Config.loginUrl, data)
            .then(response => {
                console.log(response)
                if(response.data=="INVALID_EMAIL" || response.data=="INVALID_PASS" || response.data=="INVALID_ROLE"){
                    this.setState({error:response.data,data:{}})
                }
                else{
                    this.setState({error:"",data:response.data})
                }
            })
            .catch(error=>{
                this.setState({error:"Something went wrong while validation",data:{}})
            });

    }

    setEmail=(val)=>{
        this.setState({email:val});
    }

    setPassword=(val)=>{
        this.setState({password:val});
    }

    resetVals=()=>{
        this.setState({email:"",password:"",data:"",error:""});
    }
    
    render() {
      return <React.Fragment>
            {!this.state.data?<div className="Login">
                {
                   this.state.serverUp?
                        <React.Fragment>
                            <marquee className="marqueeMsg">{Config.loginDisp}</marquee>
                            <form onSubmit={e=>this.handleSubmit(e)} className="loginForm"> 
                            <Container>
                                <Row>
                                    <Col md={3} className="loginHeader">Email :</Col>
                                    <Col>
                                        <FormControl
                                        autoFocus
                                        placeholder="example@gmail.com"
                                        type="email"
                                        value={this.state.email}
                                        onChange={e => this.setEmail(e.target.value)}
                                    />
                                    </Col>
                                </Row>
                                <br/>
                                <Row>
                                    <Col md={3}className="loginHeader">Password :</Col>
                                    <Col>
                                        <FormControl
                                        value={this.state.password}
                                        placeholder="password"
                                        onChange={e => this.setPassword(e.target.value)}
                                        type="password"
                                    />
                                    </Col>
                                </Row>
                            </Container>
                                <Button disabled={!this.validateForm()} type="submit" className="btn btn-primary">
                                Login
                                </Button>
                                <Button onClick={e => this.resetVals()} type="reset" className="btn btn-secondary">
                                Reset
                                </Button>
                            </form>
                            {this.state.error=="" && this.state.data !=""?null:<ErrorScreen errMsg={this.state.error}/>}
                        </React.Fragment>
                        
                    :<ErrorScreen errMsg={Config.serverIssue}/>
                }
            </div>:<RoleRouter data={this.state.data}/>}
            </React.Fragment>
    }
  }

export default Login;
