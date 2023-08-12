from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from api.config import settings


client = AsyncIOMotorClient(settings.DATABASE_URL)


db = client.Kanban

column_collection = db.column
task_collection = db.task


def cols_helper(cols) -> dict:
    return {"id": str(cols["_id"]), "title": cols["title"]}


def task_helper(task: dict) -> dict:
    return {
        "id": str(task["_id"]),
        "columnId": str(task["column_id"]),
        "content": task["content"],
    }


def return_model(column: dict):
    return {
        "id": str(column["_id"]),
        "title": column["title"],
        "tasks": [task_helper(task=task) for task in column["Tasks"]],
    }


async def fetch_all():
    cols = []
    tasks = []
    columns = await column_collection.find().to_list(100)

    for col in columns:
        cols.append(cols_helper(col))

    tsks = await task_collection.find().to_list(100)
    print(tasks)
    for tsk in tsks:
        tasks.append(task_helper(tsk))

    return cols, tasks


async def add_column(data: dict):
    result = await column_collection.insert_one(data)
    new_col = await column_collection.find_one({"_id": result.inserted_id})
    return cols_helper(new_col)


async def update_column(id: str, data: dict):
    result = await column_collection.update_one({"_id": ObjectId(id)}, {"$set": data})
    new_col = await column_collection.find_one({"_id": ObjectId(id)})
    return cols_helper(new_col)


async def delete_column(id: str):
    result = await column_collection.delete_one({"_id": ObjectId(id)})
