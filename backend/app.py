from chalice import Chalice
from chalicelib import (
    storage_service,
    textract_service,
    medical_comprehend_service,
    dynamodb_service,
)

import base64
import json
import time

app = Chalice(app_name="backend")
app.debug = True

storage_location = "mihir-test-bucket-2"

storage_service = storage_service.StorageService(storage_location)
textract_service = textract_service.TextractService(storage_service)
medical_comprehend_service = medical_comprehend_service.MedicalComprehendService()
dynamodb_service = dynamodb_service.DynamoDBService()


@app.route("/images", methods=["POST"], cors=True)
def upload_image():
    """processes file upload and saves file to storage service"""
    request_data = json.loads(app.current_request.raw_body)
    file_name = request_data["filename"]
    file_bytes = base64.b64decode(request_data["filebytes"])
    image_info = storage_service.upload_file(file_bytes, file_name)
    return image_info


@app.route("/images/{image_id}/extract-text", methods=["POST"], cors=True)
def translate_image_text(image_id):
    """extract text in the specified image and perform NER"""
    # apply textract to extract text from image
    text_lines = textract_service.analyze_document(image_id)
    # apply NER to extract entities from text
    entities = medical_comprehend_service.detect_entities(text_lines)
    return {"entities": entities}


@app.route("/save-data", methods=["POST"], cors=True)
def save_data_to_db():
    request_data = json.loads(app.current_request.raw_body)
    data = request_data["data"]
    username = request_data["username"]
    print(data)
    print(username)
    if data:
        for item in data:
            del item["Id"]
        dynamodb_service.put_item(
            {
                "lead_data": data,
                "username": username,
                "lead_id": int("".join(str(time.time()).split("."))),
            }
        )
    return {"message": "Data saved successfully"}


@app.route("/get-all-leads", methods=["GET"], cors=True)
def get_all_leads():
    response = dynamodb_service.get_all_items()
    return {"leads": response}


@app.route("/auth", methods=["POST"], cors=True)
def auth():
    request_data = json.loads(app.current_request.raw_body)
    username = request_data["username"]
    password = request_data["pass"]
    response = dynamodb_service.get_auth(username, password)
    if response:
        return {"message": "success", "username": username}
    return {"message": "failure"}


@app.route("/search", methods=["POST"], cors=True)
def search():
    request_data = json.loads(app.current_request.raw_body)
    search_text = request_data["search"]
    response = dynamodb_service.get_all_items()
    search_data = []
    print("search text", search_text)
    for item in response:
        for data in item.get("lead_data"):
            if search_text.lower() in data.get("Text").lower():
                search_data.append(item)
                break
    print(search_data)
    return {"leads": search_data}
