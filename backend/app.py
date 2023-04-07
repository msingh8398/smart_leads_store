from chalice import Chalice
from chalicelib import (
    storage_service,
    textract_service,
    medical_comprehend_service,
)

import base64
import json

app = Chalice(app_name="backend")
app.debug = True

storage_location = "mihir-test-bucket-2"
storage_service = storage_service.StorageService(storage_location)
textract_service = textract_service.TextractService(storage_service)
medical_comprehend_service = medical_comprehend_service.MedicalComprehendService()


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
