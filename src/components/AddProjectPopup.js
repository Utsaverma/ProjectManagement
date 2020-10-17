import axios from 'axios';
import React from 'react';
import {Modal ,Button , FormControl, Container , Row, Col} from 'react-bootstrap';
import Select from 'react-select';
import Config from '../assets/config.json';
import $ from 'jquery';

function ModalPopup(props) {
    // Hooks,states for Functional Components
    const [projectName, setprojectName] = React.useState("");
    const [empList, setempList] = React.useState([]);
    const [openFresh,setOpenFresh] = React.useState(true);
    const [dispMsg,setDispMsg] = React.useState("")

    React.useEffect(()=>{
        $(".close-btn").unbind().on( "click", function() {
            setprojectName("")
            setempList([]);
            setOpenFresh(true);
        });
        $("button.close").unbind().on( "click", function() {
            setprojectName("")
            setempList([]);
            setOpenFresh(true);
        });
    })

    // To be triggred when "Add Project" button is clicked
    const handleSubmit=(e)=>{
        e.preventDefault();
        let projectNme = projectName.trim()
        let req_obj = {
            "mId": props.managerId,
            "projectNme": projectNme,
            "eidList": empList.map(v=>v.value)
        }
        axios.post(Config.basepath+Config.addProject,req_obj)
        .then(resp=>{
            if(resp.data == "FAILURE"){
                setDispMsg(Config.defaultErr);
            }
            else if(resp.data == "PROJECT_NME_EXIST"){
                setDispMsg(Config.projectExist);
            }
            else{
                setDispMsg(Config.projectAdded);
            }
        })
        .catch(err=>{
            console.log(err)
            setDispMsg(Config.defaultErr)
        })
        setprojectName("")
        setempList([]);
        setOpenFresh(false)
        
    }

    // Form validations for inputs
    const validateForm=()=>{
        return projectName.trim().length > 0 && empList.length > 0;
    }

    // to handel multi selected employees
    const getSelectedOptions=(v)=>{
        if(v==null){
            v=[]
        }
        setempList(v)
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
            New Project Data
          </Modal.Title>
          <span className="note">* marked feilds are mandatory</span>
        </Modal.Header>
        <Modal.Body>
            {props.openFresh && openFresh?
                <form onSubmit={e=>handleSubmit(e)}>
                    <Container>
                        <Row>
                          <Col md={3}>Project Name : <span className="important" title="Mandatory">*</span></Col>
                          <Col><FormControl
                              autoFocus
                              placeholder="Enter Project Name"
                              value={projectName}
                              onChange={e => setprojectName(e.target.value)}
                          /></Col>
                        </Row>
                        <br/>
                        <Row>
                          <Col md={3}>Select Employees : <span className="important" title="Mandatory">*</span></Col>
                          <Col><Select
                            isMulti
                            name="empName"
                            options={props.empdata}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            onChange={val => getSelectedOptions(val)}
                            /></Col>
                        </Row>
                        <br/>
                    </Container>
                    <Button disabled={!validateForm()} type="submit" className="addProject">
                    Add Project
                    </Button>
                    <Button onClick={props.onHide} className="close-btn btn-secondary">Close</Button>
                </form>
                :<div>{dispMsg}</div>
            }     
        </Modal.Body>
      </Modal>
    );
  }
  
  // Popup to add new project
  function AddProjectPopup(props) {
    const [modalShow, setModalShow] = React.useState(false);
  
    return (
      <>
        <a onClick={() => setModalShow(true)} href="#">
          Click here to add New project
        </a>
  
        <ModalPopup
          show={modalShow}
          onHide={() => setModalShow(false)}
          empdata={props.empList}
          managerId = {props.managerId}
          openFresh = {true}
        />
      </>
    );
  }
  
  export default AddProjectPopup;