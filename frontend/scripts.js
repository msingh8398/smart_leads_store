"use strict";

const serverUrl = "http://127.0.0.1:8000";
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
        body: JSON.stringify({"data":data.entities})
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

function showAllLeads(data){
    console.log(data);
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