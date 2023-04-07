"use strict";

const serverUrl = "http://127.0.0.1:8000";
// const serverUrl="https://x1sfhszghj.execute-api.us-east-1.amazonaws.com/api/"

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
    // document.getElementById("view").style.display = "block";
    // document.getElementById("my_table_id").style.display = "block";
    // document.getElementById("view").className = "border";
    

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


function showResult(data) {
    console.log(data.entities);
    var table_row = '';
    data.entities.forEach(element => {
        table_row += '<tr><td class="col-md-2">'+element.Text+'</td><td class="col-md-2">'+element.Type+'</td><td class="col-md-2">'+element.Score+'</td><td class="col-md-2"><a class="btn btn-dark">Edit</a></td></tr>'
    });

    document.getElementById("table_data").innerHTML = table_row;
    document.getElementById("view").style.display = "block";
    document.getElementById("my_table_id").style.display = "block";
    document.getElementById("view").className = "border";
}

function uploadAndTranslate() {
    uploadImage()
        .then(image => updateImage(image))
        .then(image => extractImageData(image))
        .then(image => showResult(image))
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