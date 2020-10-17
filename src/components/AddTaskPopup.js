import axios from 'axios';
import React from 'react';
import {Modal ,Button , FormControl, Container , Row, Col} from 'react-bootstrap';
import Select from 'react-select';
import Config from '../assets/config.json';
import $ from 'jquery';

function ModalPopup(props) {
    // Hooks,states for Functional Components
    const [taskName, setTaskName] = React.useState("");
    const [project,setProject] = React.useState({value:"",label:""});
    const [assigne, setAssigne] = React.useState({value:"",label:""});
    const [openFresh,setOpenFresh] = React.useState(true);
    const [dispMsg,setDispMsg] = React.useState("")

    React.useEffect(()=>{
        $(".close-btn").unbind().on( "click", function() {
            setTaskName("");
            setProject({value:"",label:""});
            setAssigne({value:"",label:""});
            setOpenFresh(true);
        });
        $("button.close").unbind().on( "click", function() {
            setTaskName("");
            setProject({value:"",label:""});
            setAssigne({value:"",label:""});
            setOpenFresh(true);
        });
    })

    // To be triggred when "Add Task" button is clicked
    const handleSubmit=(e)=>{
        e.preventDefault();
        let taskNme = taskName.trim()
        let req_obj = {
            "taskName":taskNme,
            "taskAssigne":assigne["value"],
            "taskCreator":props.creater,
            "tiedToProj":project["value"],
            "status":"Active"
        }
        axios.post(Config.basepath+Config.addTask,req_obj)
        .then(resp=>{
            if(resp.data == "FAILURE"){
                setDispMsg(Config.defaultErr);
            }
            else{
                setDispMsg(Config.taskAdded);
            }
        })
        .catch(err=>{
            console.log(err)
            setDispMsg(Config.defaultErr)
        })
        setTaskName("");
        setProject({value:"",label:""});
        setAssigne({value:"",label:""});
        setOpenFresh(false);
        
    }
    // Form validations for inputs
    const validateForm=()=>{
        return taskName.trim().length > 0 && project["value"].length > 0 && assigne["value"].length > 0;
    }

    // to handel selected employee data
    const getSelectedOptions=(v)=>{
        if(v==null){
            v={value:"",label:""}
        }
        setAssigne(v)
    }

    // to handel selected project data
    const getSelectedOptionsProject =(v)=>{
        if(v==null){
            v={value:"",label:""}
        }
        setProject(v)
    }

    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            New Task Data
          </Modal.Title>
          <span className="note">* marked feilds are mandatory</span>
        </Modal.Header>
        <Modal.Body>
            {props.openFresh && openFresh?
                <form onSubmit={e=>handleSubmit(e)}>
                    <Container>
                        <Row>
                            <Col md={3}>Select Project : <span className="important" title="Mandatory">*</span></Col>
                            <Col><Select
                                name="projList"
                                options={props.projectlist}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                onChange={val => getSelectedOptionsProject(val)}
                                />
                            </Col>
                        </Row>
                        <br/>
                        <Row>
                            <Col md={3}>Task Name : <span className="important" title="Mandatory">*</span></Col>
                            <Col><FormControl
                                autoFocus
                                value={taskName}
                                onChange={e => setTaskName(e.target.value)}
                            />
                            </Col>
                        </Row>
                        <br/>
                        <Row>
                            <Col md={3}>Assignee To : <span className="important" title="Mandatory">*</span></Col>
                            <Col><Select
                                name="empName"
                                options={props.empdata}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                onChange={val => getSelectedOptions(val)}
                                />
                            </Col>
                        </Row>
                    </Container>  
                    <br/>                  
                    <Button disabled={!validateForm()} type="submit" className="addTask">
                    Add Task
                    </Button>
                    <Button onClick={props.onHide} className="close-btn btn-secondary">Close</Button>
                </form>
                :<div>{dispMsg}</div>
            }     
        </Modal.Body>
      </Modal>
    );
  }
  
  // Popup to add new task
  function AddTaskPopup(props) {
    const [modalShow, setModalShow] = React.useState(false);
  
    return (
      <>
        <a  onClick={() => setModalShow(true)} href="#">
          Click here to add New Task
        </a>
  
        <ModalPopup
          show={modalShow}
          onHide={() => setModalShow(false)}
          empdata={props.empList}
          projectlist={props.projectList}
          creater = {props.creater}
          openFresh = {true}
        />
      </>
    );
  }
  
  export default AddTaskPopup;