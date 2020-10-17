from flask import Flask , request, jsonify
import json 
from flask_cors import CORS
import base64

app = Flask(__name__)
CORS(app)

global user_data_source, role_data_source, project_manage_data_source, project_master_data_source,task_data_source


with open('assets/userData.json') as f:
    user_data_source = json.load(f)

with open('assets/roleData.json') as f:
    role_data_source = json.load(f)

with open('assets/projectManageData.json') as f:
    project_manage_data_source = json.load(f)

with open('assets/projectMasterData.json') as f:
    project_master_data_source = json.load(f)

with open('assets/tasksProjectMap.json') as f:
    task_data_source = json.load(f)



@app.route("/")
def check_Conn():
    global user_data_source,role_data_source
    return "SUCCESS"

@app.route("/validateUser",methods=["POST"])
def validate():
    if request.method == "POST":
        global user_data_source, role_data_source
        request_data = request.get_json()
        email = request_data['email']
        password = base64.b64decode(request_data['pass']).decode("utf-8")
        matched = {}
        for data in user_data_source:
            if(data["emailId"].upper() == email.upper()):
                matched = data
        if(matched):
            if(matched["pass"] == password):
                matched["role"] = "".join([role_data["role"] for role_data in role_data_source if role_data["roleId"] ==matched["roleId"]])
                if(matched["role"] != ""):
                    return matched
                else:
                    return "INVALID_ROLE"
            else:
                return "INVALID_PASS"
        else:
            return "INVALID_EMAIL"
    else:
        return "FAILURE"

@app.route("/projectsDetails/<empId>",methods=["GET"])
def project_under(empId):
    # empId = request.args("empId")
    # print(empId)
    empId = empId.strip()
    resp = []
    global project_manage_data_source
    for project in project_manage_data_source:
        if project["managerEmpId"]==empId:
            project["totalEmpForProject"] = len([project_master for project_master in project_master_data_source if project_master["projectId"]==project["projectId"] and project_master["managerEmpId"]==project["managerEmpId"]])
            resp.append(project)
    # print(resp)
    return jsonify(resp)

@app.route("/empList/<managerEmpId>",methods=["GET"])
def emp_list_for_project(managerEmpId):
    managerEmpId = managerEmpId.strip()
    global user_data_source
    resp = []
    for data in user_data_source:
        if data["empId"]!=managerEmpId and data["roleId"]!="1":
            new_d={}
            new_d["empId"] = data["empId"]
            new_d["name"] = data["name"]
            new_d["role"] = get_role(data["roleId"])
            resp.append(new_d)
    return jsonify(resp)

@app.route("/empListBelowManager/<EmpId>",methods=["GET"])
def emp_list_for_task(EmpId):
    EmpId = EmpId.strip()
    global user_data_source , project_master_data_source
    resp = []
    empList = []
    project_list = get_project_Id_list(EmpId)
    for project_id in project_list:
        empList.extend([project["empId"] for project in project_master_data_source if project["projectId"]==project_id])
    for data in user_data_source:
        if data["roleId"]!="1" and data["empId"] in empList:
            new_d={}
            new_d["empId"] = data["empId"]
            new_d["name"] = data["name"]
            new_d["role"] = get_role(data["roleId"])
            resp.append(new_d)
    return jsonify(resp)

@app.route("/addProject",methods=["POST"])
def addProject():
    if request.method == "POST":
        global project_manage_data_source,project_master_data_source
        request_data = request.get_json()
        # print(request_data)
        project_Id = "Proj"+str(int(project_manage_data_source[-1]["projectId"][4:]) + 1)
        # print(project_Id)
        if(check_project_name(request_data["projectNme"])):
            return "PROJECT_NME_EXIST"
        project_details = {
            "managerEmpId":request_data["mId"],
            "projectId":project_Id,
            "projectName":request_data["projectNme"],
            "status":"Active"
        }
        project_emp_list = []
        for empId in request_data["eidList"]:
            project_master = {
                "projectId":project_Id,
                "empId":empId,
                "managerEmpId":request_data["mId"]
            }
            project_emp_list.append(project_master)
        try:
            project_manage_data_source.append(project_details)
        except:
            return "Something went wrong"
        try:
            project_master_data_source.extend(project_emp_list)
        except:
            project_manage_data_source = filter(lambda proj: proj["projectId"]!=project_details["projectId"],project_manage_data_source)
            return "Something went wrong"
        print(project_details,project_emp_list)
        return "SUCCESS"
    else:
        return "FAILURE"

@app.route("/tasksDetails/<empId>",methods=["GET"])
def tasks_under(empId):
    if request.method == "GET":
        global task_data_source , project_manage_data_source
        empId = empId.strip()
        resp = []
        project_data_list = []
        distinct_projid = []
        for project in project_master_data_source:
            if project["empId"]==empId and project["projectId"] not in distinct_projid:
                project_data_list.append(project)
                distinct_projid.append(project["projectId"])
        # task_id_counter = int(task_data_source[-1]["taskId"][5:]) + 1

        for project in project_data_list:
            all_tasks_tied_to_curr_proj = [task for task in task_data_source if task["tiedToProj"].upper() == project["projectId"].upper()]
            if(len(all_tasks_tied_to_curr_proj)>0):
                for task in all_tasks_tied_to_curr_proj:
                    task["projectName"] = get_project_name(task["tiedToProj"])
                    task["assigne"] = get_empName(task["taskAssigne"])
                    task["createdBy"] = get_empName(task["taskCreator"])
                    resp.append(task)
        return jsonify(resp)
    else:
        return "FAILURE"
    

@app.route("/addTask",methods=["POST"])
def create_Task():
    if request.method == "POST":
        request_data = request.get_json()
        print(request_data)
        global task_data_source
        task_id = "TASK-" + str(int(task_data_source[-1]["taskId"][5:]) + 1)
        task = {
            "taskId":task_id,
            "taskName":request_data["taskName"],
            "taskAssigne":request_data["taskAssigne"],
            "taskCreator":request_data["taskCreator"],
            "tiedToProj":request_data["tiedToProj"],
            "commentsAdded":[],
            "status":"Active"
        }
        try:
            task_data_source.append(task)
            return "SUCCESS"
        except:
            return "ERROR"
    else:
        return "FAILURE"

@app.route("/projectsMapped/<empId>",methods=["GET"])
def projects_mapped_to(empId):
    if request.method =="GET":
        project_data_list = []
        distinct_projid = []
        for project in project_master_data_source:
            if project["empId"]==empId and project["projectId"] not in distinct_projid:
                project["projectName"] = get_project_name(project["projectId"])
                project_data_list.append(project)
                distinct_projid.append(project["projectId"])
        return jsonify(project_data_list)
    else:
        return "FAILURE"
# @app.route("/demo",methods=["GET"])
# def get_data():
#     print(project_manage_data_source)
#     print(project_master_data_source)
#     return "SUCCESS"

@app.route("/addComment",methods=["POST"])
def addCOmment():
    if request.method == "POST":
        request_data = request.get_json()
        global task_data_source
        try:
            for task in task_data_source:
                if(task["taskId"]==request_data["taskId"] and task["tiedToProj"]==request_data["tiedToProj"]):
                    task["commentsAdded"].append(request_data["commment"])
                    break
            return "SUCCESS"
        except:
            return "ERROR"
    else:
        return "FAILURE"


def get_role(roleId):
    global role_data_source
    for roledata in role_data_source:
        if(roledata["roleId"]==roleId):
            return roledata["role"]
    return ""

def check_project_name(projNme):
    name_present = False
    for project in project_manage_data_source:
        if project["projectName"].upper() ==projNme.upper():
            name_present = True
            break
    return name_present

def get_project_name(projId):
    global project_manage_data_source
    for project in project_manage_data_source:
        if(project["projectId"].upper()==projId.upper()):
            return project["projectName"]
    return ""

def get_empName(eid):
    global user_data_source
    for user in user_data_source:
        if(user["empId"]==eid):
            return user["name"]
    return ""

def get_project_Id_list(empId):
    global project_master_data_source
    proj_id_list = []
    proj_id_list =[project["projectId"] for project in project_master_data_source if project["empId"]==empId]
    return list(set(proj_id_list))

if __name__ == '__main__':
    app.run(debug=True)
