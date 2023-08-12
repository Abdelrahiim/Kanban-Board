from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from api.config import settings


client = AsyncIOMotorClient(settings.DATABASE_URL)


db = client.Kanban

column_collection = db.column
task_collection = db.task


def cols_helper(cols) -> dict:
    """Serializer of The Column Collection

    Args:
        cols (dict): column collection instance

    Returns:
        dict:  Serialized Version 
    """
    return {"id": str(cols["_id"]), "title": cols["title"]}

# ---------------------------------------------------------------

def task_helper(task: dict) -> dict:
    """Serializer of The Task Collection

    Args:
        task (dict): task collection instance

    Returns:
        dict: Serialized Version 
    """
    return {
        "id": str(task["_id"]),
        "columnId": str(task["column_id"]),
        "content": task["content"],
    }



# ---------------------------------------------------------------
async def fetch_all() ->  tuple[list, list] :
    """ Get Al The Data From  Mongodb server 

    Returns:
        tuple[list, list]
    """
    cols = []
    tasks = []
    columns = await column_collection.find().to_list(100)

    for col in columns:
        cols.append(cols_helper(col))

    tsks = await task_collection.find().to_list(100)
    
    for tsk in tsks:
        tasks.append(task_helper(tsk))

    return cols, tasks


# ---------------------------------------------------------------
async def add_column(data: dict):
    """get the data from the frontend the insert it into the database

    Args:
        data (dict): This is the Data from the frontend

    Returns:
        dict: 
    """
    result = await column_collection.insert_one(data)
    new_col = await column_collection.find_one({"_id": result.inserted_id})
    return cols_helper(new_col)


# ---------------------------------------------------------------
async def update_column(id: str, data: dict):
    result = await column_collection.update_one({"_id": ObjectId(id)}, {"$set": data})
    new_col = await column_collection.find_one({"_id": ObjectId(id)})
    return cols_helper(new_col)



# ---------------------------------------------------------------
async def delete_column(id: str):
    await column_collection.delete_one({"_id": ObjectId(id)})
    await task_collection.delete_many({"column_id":ObjectId(id)})
    
