import React from 'react';
import {Table, Dropdown,DropdownButton} from 'react-bootstrap';
import axios from 'axios';
import Config from '../assets/config.json';
import AddProjectPopup from './AddProjectPopup';
import $ from 'jquery';

class Manager extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      projectData:[],
      empList:[]
    }
  }
  componentDidMount(){
    // get manager specific data 
    axios.get(Config.basepath+Config.empList+this.props.data["empId"])
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
    axios.get(Config.basepath+Config.managerData+this.props.data["empId"])
    .then(resp=>{
      console.log(resp)
      this.setState({projectData:resp.data})
    })
    .catch(err=>{
      console.log(err)
    })
  }

  componentDidUpdate(){
    $("#dropdown-item-button").removeClass("btn").removeClass("btn-primary");
  }

  getEmpDetails=(projectId)=>{
    let managerId=this.props.data["empId"]
    console.log(projectId,managerId)
  }

  // To referesh Screen data
  refreshData=()=>{
    axios.get(Config.basepath+Config.managerData+this.props.data["empId"])
    .then(resp=>{
      console.log(resp)
      this.setState({projectData:resp.data})
    })
    .catch(err=>{
      console.log(err)
    })
  }
  render() {
    return <React.Fragment>
      <div className="roleMsg">Below is the list of Projects that you created:</div>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th onClick={()=>this.refreshData()}><i className="fa fa-refresh" aria-hidden="true" title="Refresh"></i> S No</th>
              <th>Project Id</th>
              <th>Project Name</th>
              <th>Employee Count</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.projectData.length!=0?this.state.projectData.map((row,index)=>{
                return <tr key={index}>
                  <td>{index+1}</td>
                  <td>{row["projectId"]}</td>
                  <td>{row["projectName"]}</td>
                  <td >
                        {
                          row["empList"].length!=0?
                            <DropdownButton id="dropdown-item-button" title={row["totalEmpForProject"]}>
                            {
                              row["empList"].map((employee,index)=>{
                                return <Dropdown.Item as="button" key={index}>{employee}</Dropdown.Item>
                              })
                            }
                          </DropdownButton>:row["totalEmpForProject"]
                        }
                        
                  </td>
                  <td>{row["status"]}</td>
                </tr>
              }):<tr><td colSpan="5">No Project Under You</td></tr>
            }
          </tbody>
        </Table>
        <AddProjectPopup empList={this.state.empList} managerId={this.props.data["empId"]}/>
      </React.Fragment>
  }
}

export default Manager;