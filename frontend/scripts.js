"use strict";

// const serverUrl = "http://127.0.0.1:8000";
const serverUrl = "https://pi78f25116.execute-api.us-east-1.amazonaws.com/api/";
var data = [];
async function uploadImage() {
    // encode input file as base64 string for upload
    let file = document.getElementById("file").files[0];
    let converter = new Promise(function(resolve, reject) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result
            .toString().replace(/^data:(.*,)?/, ''));
        reader.onerror = (error) => reject(error);
    });
    let encodedString = await converter;

    // clear file upload input field
    document.getElementById("file").value = "";

    // make server call to upload image
    // and return the server upload promise
    return fetch(serverUrl + "/images", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({filename: file.name, filebytes: encodedString})
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new HttpError(response);
        }
    })
}

function updateImage(image) {
    let imageElem = document.getElementById("image");
    imageElem.src = image["fileUrl"];
    imageElem.alt = image["fileId"];

    return image;
}

function extractImageData(image) {
    // make server call to translate image
    // and return the server upload promise
    return fetch(serverUrl + "/images/" + image["fileId"] + "/extract-text", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new HttpError(response);
        }
    })
}


function saveData() {
    return fetch(serverUrl + "/save-data", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"data":data.entities, "username":sessionStorage.getItem("username")})
    }).then(response => {
        if (response.ok) {
            alert("Data saved successfully");
        } else {
            throw new HttpError(response);
        }
    })
}

function showEditBox(text, id) {
    $("#myModal").modal('show');
    document.getElementById("modal_input").value = text;
    document.getElementById("hiddenData").value = id;
}

function updateValue() {
    var text = document.getElementById("modal_input").value;
    var id = document.getElementById("hiddenData").value;

    for (var i = 0; i < data.entities.length; i++) {
        if (data.entities[i].Id == id) {
            data.entities[i].Text = text;
            break;
        }
    }
    showResult(data)
    $("#myModal").modal('hide');
}

function showResult(incoming_data) {
    data = incoming_data;
    console.log(data.entities);
    var table_row = '';
    data.entities.forEach(element => {
        table_row += '<tr id="data_'+element.Id+'"><td class="col-md-2">'+element.Text+'</td><td class="col-md-2">'+element.Type+'</td><td class="col-md-2">'+element.Score+'</td><td class="col-md-2"><a class="btn btn-dark" href="#myModal" onclick="showEditBox(\'' + element.Text +'\',\''+ element.Id + '\')">Edit</a></td></tr>'
    });

    document.getElementById("table_data").innerHTML = table_row;
    document.getElementById("view").style.display = "block";
    document.getElementById("my_table_id").style.display = "block";
    document.getElementById("save_btn").style.display = "block";
    document.getElementById("view").className = "border";
}

function uploadAndTranslate() {
    uploadImage()
        .then(image => updateImage(image))
        .then(image => extractImageData(image))
        .then(data => showResult(data))
        .catch(error => {
            alert("Error: " + error);
        })
}

class HttpError extends Error {
    constructor(response) {
        super(`${response.status} for ${response.url}`);
        this.name = "HttpError";
        this.response = response;
    }
}

function getAllLeads() {
    return fetch(serverUrl + "/get-all-leads", {
        method: "GET",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new HttpError(response);
        }
    })
}

function showAllLeads(new_data){
    if (new_data.leads.length == 0){
        alert("No leads found");
        return;
    }
    console.log(new_data);
    var table_row = '';
    new_data.leads.forEach(element => {
        var tmp_row = '<table class="table"><tr><th class="col-md-2">Text</th><th class="col-md-2">Type</th><th class="col-md-2">Score</th></tr>';
        element.lead_data.forEach(element2 => {
            tmp_row += '<td class="col-md-2">'+element2.Text+'</td><td class="col-md-2">'+element2.Type+'</td><td class="col-md-2">'+element2.Score+'</td></tr>'
        });
        tmp_row += '</table>';
        if (sessionStorage.getItem("username") == element.username){
            table_row += '<tr id="data_'+element.lead_id+'"><td class="col-md-2">'+element.lead_id+'</td><td class="col-md-2">'+element.username+'</td><td class="col-md-2">'+tmp_row+'</td><td class="col-md-2"><a class="btn btn-dark">Edit</a> <a class="btn btn-danger" onclick="deleteLeadMain('+element.lead_id+')" disabled>Delete</a></td></tr>'
        } else {
            table_row += '<tr id="data_'+element.lead_id+'"><td class="col-md-2">'+element.lead_id+'</td><td class="col-md-2">'+element.username+'</td><td class="col-md-2">'+tmp_row+'</td><td class="col-md-2"><a class="btn btn-dark" onclick="notAllowed()"}">Edit</a> <a class="btn btn-danger" onclick="notAllowed()">Delete</a></td></tr>'
        }
    });

    document.getElementById("leads_data").innerHTML = table_row;
    document.getElementById("data_container").style.display = "block";
}

function showAllLeadsData(){
    document.getElementById("main_page").style.display = "none";
    getAllLeads()
        .then(data => showAllLeads(data))
        .catch(error => {
            alert("Error: " + error);
        })
}

function doAuth(){
    var username = $("#username").val(); 
    var pass = $("#pass").val();
    return fetch(serverUrl + "/auth", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"username":username, "pass":pass})
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new HttpError(response);
        }
    })
}

function handleSuccess(response){
    if (response.message == "success"){
        sessionStorage.setItem("username", response.username);
        window.location.href = "index.html"
    } else {
        alert("Invalid username or password");
    }
}

function authenticateUser(){
    doAuth().then(data => handleSuccess(data))
    .catch(error => {
        alert("Error: " + error);
    })
}

function logout(){
    sessionStorage.removeItem("username");
    window.location.href = "login.html"
}

function getHome(){
    window.location.reload();
} 

function notAllowed(){
    alert("You are not allowed to edit or delete this lead");
}


function searchLeads() {
    var search = $("#searchBox").val();
    return fetch(serverUrl + "/search", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"search":search})
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new HttpError(response);
        }
    })
}

function searchData(){
    searchLeads()
        .then(data => showAllLeads(data))
        .catch(error => {
            alert("Error: " + error);
        })
}

function handleDelete(response){
    if (response.message == "success"){
        alert("Lead deleted successfully");
        window.location.reload();
    } else {
        alert("Error deleting lead");
    }
}

function deleteLead(lead_id) {
    return fetch(serverUrl + "/delete-lead", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"lead_id":lead_id})
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new HttpError(response);
        }
    })
}

function deleteLeadMain(lead_id){
    if (confirm("Are you sure you want to delete this lead?")){
        deleteLead(lead_id)
            .then(data => handleDelete(data))
            .catch(error => {
                alert("Error: " + error);
            })
    }
}