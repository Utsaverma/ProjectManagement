import React from 'react';
import {Table} from 'react-bootstrap';
import axios from 'axios';
import Config from '../assets/config.json';
import AddTaskPopup from './AddTaskPopup';

class Lead extends React.Component {
  // states for Class component
  constructor(props){
    super(props);
    this.state = {
      taskData:[],
      empList:[],
      projectList:[]
    }
  }

  // will be invoked on initial mounting 
  componentDidMount(){
    // getting lead specific data
    axios.get(Config.basepath+Config.empListbelowManager+this.props.data["empId"])
    .then(resp=>{
      console.log(resp)
      let f_list=[]
      resp.data.map(emp=>{
        let obj = {}
        obj["value"] = emp["empId"];
        obj["label"] = "(" + emp["empId"] + ") " + emp["name"] +" , "+emp["role"];
        f_list.push(obj)
      })
      this.setState({empList:f_list})
    })
    .catch(err=>{
      console.log(err)
    })
    axios.get(Config.basepath+Config.leadData+this.props.data["empId"])
    .then(resp=>{
      console.log(resp)
      this.setState({taskData:resp.data})
    })
    .catch(err=>{
      console.log(err)
    })
    axios.get(Config.basepath+Config.underProjects+this.props.data["empId"])
    .then(resp=>{
      let f_list=[]
      resp.data.map(proj=>{
        let obj = {}
        obj["value"] = proj["projectId"];
        obj["label"] = "(" + proj["projectId"] + ") " + proj["projectName"];
        f_list.push(obj)
      })
      this.setState({projectList:f_list})
    })
    .catch(err=>{
      console.log(err)
    })
  }

  // to refresh screen data
  refreshData=()=>{
    axios.get(Config.basepath+Config.leadData+this.props.data["empId"])
    .then(resp=>{
      console.log(resp)
      this.setState({taskData:resp.data})
    })
    .catch(err=>{
      console.log(err)
    })
  }
  render() {
    return <React.Fragment>
      <div className="roleMsg">Below is the list of tasks that you created:</div>
        <Table striped bordered hover>
          <thead>
            <tr>
            <th onClick={()=>this.refreshData()}><i className="fa fa-refresh" aria-hidden="true" title="Refresh"></i> S No</th>
              <th>Task Id</th>
              <th>Task Name</th>
              <th>Project Name</th>
              <th>Assignee</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.taskData.length!=0?this.state.taskData.map((row,index)=>{
                return <tr key={index}>
                  <td>{index+1}</td>
                  <td>{row["taskId"]}</td>
                  <td>{row["taskName"]}</td>
                  <td>({row["tiedToProj"]}),&nbsp;{row["projectName"]}</td>
                  <td>({row["taskAssigne"]}),&nbsp;{row["assigne"]}</td>
                  <td>{row["status"]}</td>
                </tr>
              }):<tr><td colSpan="6">You haven't created any tasks yet</td></tr>
            }
          </tbody>
        </Table>
        <AddTaskPopup empList={this.state.empList} projectList={this.state.projectList} creater={this.props.data["empId"]}/>
      </React.Fragment>
  }
}

export default Lead;