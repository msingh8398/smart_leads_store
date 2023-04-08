import boto3

table_name = "leads_storage"


class DynamoDBService:
    def __init__(self):
        self.resource = boto3.resource("dynamodb")
        self.table = self.resource.Table(table_name)

    def put_item(self, item):
        self.table.put_item(Item=item)

    def get_item(self, key):
        response = self.table.get_item(Key=key)
        return response.get("Item")

    def get_all_items(self):
        response = self.table.scan()
        return response.get("Items")

    def delete_item(self, key):
        self.table.delete_item(Key=key)

    def update_item(self, key, update_expression, expression_attribute_values):
        self.table.update_item(
            Key=key,
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
        )
