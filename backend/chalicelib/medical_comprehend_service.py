import boto3


class MedicalComprehendService:
    def __init__(self):
        self.client = boto3.client("comprehendmedical")

    def detect_entities(self, input_text):
        response = self.client.detect_entities_v2(Text=input_text)
        lines = []
        if response:
            lines.extend(
                [
                    {
                        "Id": entity.get("Id"),
                        "Text": entity.get("Text"),
                        "Type": entity.get("Type"),
                        "Score": str(round(entity.get("Score"), 2)),
                    }
                    for entity in response.get("Entities")
                    if entity.get("Score") > 0.5
                ]
            )
        else:
            print("No entities detected")
        return lines
