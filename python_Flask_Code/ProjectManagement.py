from flask import Flask , request, jsonify
import json 
from flask_cors import CORS
import base64

app = Flask(__name__)
CORS(app)

# Global Vriables declaration
global user_data_source, role_data_source, project_manage_data_source, project_master_data_source,task_data_source

# importing data from JSON
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


# check Connection status
@app.route("/")
def check_Conn():
    global user_data_source,role_data_source
    return "SUCCESS"

#Validate user for correct credentials
@app.route("/validateUser",methods=["POST"])
def validate():
    if request.method == "POST":
        global user_data_source, role_data_source
        request_data = request.get_json()
        email = request_data['email']
        # decrypting password
        password = base64.b64decode(request_data['pass']).decode("utf-8")
        matched = {}
        for data in user_data_source:
            if(data["emailId"].upper() == email.upper()):
                matched = data
        # If email id is present in Data Source
        if(matched):
            # If password is correct
            if(matched["pass"] == password):
                matched["role"] = "".join([role_data["role"] for role_data in role_data_source if role_data["roleId"] ==matched["roleId"]])
                # if user has valid role
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

# get project data under manager
@app.route("/projectsDetails/<empId>",methods=["GET"])
def project_under(empId):
    empId = empId.strip()
    resp = []
    global project_manage_data_source
    for project in project_manage_data_source:
        if project["managerEmpId"]==empId:
            project["totalEmpForProject"] = len([project_master for project_master in project_master_data_source if project_master["projectId"]==project["projectId"] and project_master["managerEmpId"]==project["managerEmpId"]])
            project["empList"] = ["("+str(project_master["empId"])+"), "+get_empName(project_master["empId"]) for project_master in project_master_data_source if project_master["projectId"]==project["projectId"] and project_master["managerEmpId"]==project["managerEmpId"]]
            resp.append(project)
    return jsonify(resp)
    
# Get employee list under manager
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

# get employees other than managers for Assignee feild
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

# To add project data in respective data_Source
@app.route("/addProject",methods=["POST"])
def addProject():
    if request.method == "POST":
        global project_manage_data_source,project_master_data_source
        request_data = request.get_json()
        project_Id = "Proj"+str(int(project_manage_data_source[-1]["projectId"][4:]) + 1)
        # If Project name is already present
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
        # try adding project data else raise exception
        try:
            project_manage_data_source.append(project_details)
        except:
            return "Something went wrong"
        # try adding data else remove the previously added data also
        try:
            project_master_data_source.extend(project_emp_list)
        except:
            project_manage_data_source = filter(lambda proj: proj["projectId"]!=project_details["projectId"],project_manage_data_source)
            return "Something went wrong"
        return "SUCCESS"
    else:
        return "FAILURE"

# Get all tasks created by an employye , Lead
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
    
# Add task to data source
@app.route("/addTask",methods=["POST"])
def create_Task():
    if request.method == "POST":
        request_data = request.get_json()
        print(request_data)
        global task_data_source
        # getting the task id of last task in data source, It will be a primary Key
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
        # try adding task in data source else raise exception
        try:
            task_data_source.append(task)
            return "SUCCESS"
        except:
            return "ERROR"
    else:
        return "FAILURE"

# Get Project data in which the employee is mapped
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

# Add comment for the task, update the existing task in data source
@app.route("/addComment",methods=["POST"])
def addComment():
    if request.method == "POST":
        request_data = request.get_json()
        global task_data_source
        # try updating else raise exception
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

# Utility function to get role name from role ID
def get_role(roleId):
    global role_data_source
    for roledata in role_data_source:
        if(roledata["roleId"]==roleId):
            return roledata["role"]
    return ""

# Utility function to validate project name already exists in data source or not
def check_project_name(projNme):
    name_present = False
    for project in project_manage_data_source:
        if project["projectName"].upper() ==projNme.upper():
            name_present = True
            break
    return name_present

# Utility function to get project name from project ID
def get_project_name(projId):
    global project_manage_data_source
    for project in project_manage_data_source:
        if(project["projectId"].upper()==projId.upper()):
            return project["projectName"]
    return ""

# Utility function to get employee name from EmpId
def get_empName(eid):
    global user_data_source
    for user in user_data_source:
        if(user["empId"]==eid):
            return user["name"]
    return ""

# Utility function to get project ID list unde which employee is mapped
def get_project_Id_list(empId):
    global project_master_data_source
    proj_id_list = []
    proj_id_list =[project["projectId"] for project in project_master_data_source if project["empId"]==empId]
    return list(set(proj_id_list))

if __name__ == '__main__':
    app.run(debug=True)
