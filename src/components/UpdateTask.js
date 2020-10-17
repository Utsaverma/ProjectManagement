import axios from 'axios';
import React from 'react';
import {Modal ,Button , FormControl, Container , Row, Col} from 'react-bootstrap';
import Config from '../assets/config.json';
import $ from 'jquery';

function ModalPopup(props) {
    // Hooks and states for functional component
    const [addedComment,setAddedComment] = React.useState("");
    const [openFresh,setOpenFresh] = React.useState(true);
    const [dispMsg,setDispMsg] = React.useState("")

    React.useEffect(()=>{
        $(".close-btn").unbind().on( "click", function() {
            setAddedComment("");
            setOpenFresh(true);
        });
        $("button.close").unbind().on( "click", function() {
            setAddedComment("");
            setOpenFresh(true);
        });
    })

    // update comment handler
    const handleSubmit=(e)=>{
        e.preventDefault();
        let commment = addedComment.trim()
        let req_obj = {
            "taskId":props.task["taskId"],
            "commment":commment,
            "tiedToProj":props.task["tiedToProj"],
            "status":"Active"
        }
        axios.post(Config.basepath+Config.addComment,req_obj)
        .then(resp=>{
            if(resp.data == "SUCCESS"){
                setDispMsg(Config.taskUpdated);
            }
            else{
                setDispMsg(Config.defaultErr);
            }
        })
        .catch(err=>{
            console.log(err)
            setDispMsg(Config.defaultErr)
        })
        setOpenFresh(false);
        
    }

    // form validations
    const validateForm=()=>{
        return addedComment.length>0;
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
          {props.task["taskId"]}&nbsp;:&nbsp;{props.task["taskName"]}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {props.openFresh && openFresh?
                <Container>
                    <Row>
                        <Col><b>Assignee :</b> <span className="popUpData">({props.task["taskAssigne"]}),&nbsp;{props.task["assigne"]}</span></Col>
                        <Col><b>Created By :</b> <span className="popUpData">({props.task["taskCreator"]}),&nbsp;{props.task["createdBy"]}</span></Col>
                    </Row>
                    <Row>
                        <Col><b>Linked To Project :</b> <span className="popUpData">({props.task["tiedToProj"]}),&nbsp;{props.task["projectName"]}</span></Col>
                        <Col><b>Status :</b> <span className="popUpData">{props.task["status"]}</span></Col>
                    </Row>
                    <Row>
                        <Col>
                            <b>Comments :</b> <span className="popUpData">{props.task["commentsAdded"].length==0?"NA": 
                           
                            <ul className="comments">
                                {
                                props.task["commentsAdded"].map((comment,index)=>{
                                    return <li key={index}>{comment}</li>
                                })
                            }
                            </ul>
                            }
                            </span>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <form onSubmit={e=>handleSubmit(e)}>
                                <FormControl as="textArea"
                                    autoFocus
                                    placeholder="Enter Comment Here"
                                    value={addedComment}
                                    onChange={e => setAddedComment(e.target.value)}
                                />
                                <Button disabled={!validateForm()} type="submit" className="addComment">
                                    Add Comment
                                </Button>
                                <Button onClick={props.onHide} className="close-btn btn-secondary">Close</Button>
                            </form>  
                        </Col>
                    </Row>
                </Container>
            :<div>{dispMsg}</div>}
            
        </Modal.Body>
      </Modal>
    );
  }
  
  //popup for updating comment   
  function UpdateTask(props) {
    const [modalShow, setModalShow] = React.useState(false);
  
    return (
      <>
        <a variant="primary" href="#" onClick={() => setModalShow(true)}>
          {props.task["taskId"]  }
        </a>
  
        <ModalPopup
          show={modalShow}
          onHide={() => setModalShow(false)}
          openFresh = {true}
          task={props.task}
        />
      </>
    );
  }
  
  export default UpdateTask;