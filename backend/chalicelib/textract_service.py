import boto3


class TextractService:
    def __init__(self, storage_service):
        self.client = boto3.client("textract")
        self.bucket_name = storage_service.get_storage_location()

    def analyze_document(self, file_name):
        response = self.client.analyze_document(
            Document={"S3Object": {"Bucket": self.bucket_name, "Name": file_name}},
            FeatureTypes=["TABLES"],
        )
        lines = ""
        if response:
            lines += "\n".join(
                [
                    block.get("Text")
                    for block in response.get("Blocks")
                    if block.get("BlockType") == "LINE"
                ]
            )
        else:
            print("No text detected")
        return lines
