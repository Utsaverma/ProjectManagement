import React from 'react';
import {Table} from 'react-bootstrap';
import axios from 'axios';
import Config from '../assets/config.json';
import UpdateTask from './UpdateTask';

class Developer extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      taskData:[]
    }
  }
  // will be called when mounted
  componentDidMount(){
    // Getting developer related data
    axios.get(Config.basepath+Config.devData+this.props.data["empId"])
    .then(resp=>{
      let tasks_data = resp.data.filter((data=>{
        return data["taskAssigne"]==this.props.data["empId"]
      }))
      this.setState({taskData:tasks_data})
    })
    .catch(err=>{
      console.log(err)
    })
  }

  // To refresh screen
  refreshData=()=>{
    axios.get(Config.basepath+Config.devData+this.props.data["empId"])
    .then(resp=>{
      let tasks_data = resp.data.filter((data=>{
        return data["taskAssigne"]==this.props.data["empId"]
      }))
      this.setState({taskData:tasks_data})
    })
    .catch(err=>{
      console.log(err)
    })
  }

  render() {
    return <React.Fragment>
        <div className="roleMsg">Below is the list of tasks assigned to you:</div>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th onClick={()=>this.refreshData()}><i className="fa fa-refresh" aria-hidden="true" title="Refresh"></i> S No</th>
              <th>Task Id</th>
              <th>Task Name</th>
              <th>Under Project</th>
              <th>Created By</th>
              <th>Comments</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.taskData.length!=0?this.state.taskData.map((row,index)=>{
                return <tr key={index}>
                  <td>{index+1}</td>
                  <td><UpdateTask task={row}/></td>
                  <td>{row["taskName"]}</td>
                  <td>({row["tiedToProj"]}),&nbsp;{row["projectName"]}</td>
                  <td>({row["taskCreator"]}),&nbsp;{row["createdBy"]}</td>
                  {row["commentsAdded"].length!=0?<td>
                    <ul className="comments">
                      {
                      row["commentsAdded"].map((comment,index)=>{
                          return <li key={index}>{comment}</li>
                      })
                    }
                    </ul>
                    </td>:<td>NA</td>}
                  <td>{row["status"]}</td>
                </tr>
              }):<tr><td colSpan="6">You haven't created any tasks yet</td></tr>
            }
          </tbody>
        </Table>
        {/* <marquee>Click on the Task ID to update it.</marquee> */}
      </React.Fragment>
  }
}

export default Developer;