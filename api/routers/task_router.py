from bson import ObjectId
from fastapi import APIRouter, HTTPException, Response, status

from api.schema import TaskRequest, Task
from api.db import task_collection, task_helper

tasks_router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


# ---------------------------------------------------------------
@tasks_router.post("/")
async def create_task(task: Task):
    """Create A new Task Instance

    Args:
        task (Task): data The Comes From The Frontend

    Returns:
        task: The Newly created Task
    """
    dictionary = task.model_dump()
    dictionary["column_id"] = ObjectId(dictionary["column_id"])

    result = await task_collection.insert_one(dictionary)
    new_task = await task_collection.find_one({"_id": result.inserted_id})
    return task_helper(new_task)


# ---------------------------------------------------------------
@tasks_router.put("/{id}")
async def update_task(id: str, task: TaskRequest):
    """update an Existing Instace Based on the id

    Args:
        id (str):
        task (TaskRequest): Json Object Consist Of {"content":value}

    Raises:
        e: BadRequest HTTP Exception

    Returns:
        Response Message When Successfully Updated
    """
    try:
        dictionary = task.model_dump()
        result = await task_collection.update_one(
            {"_id": ObjectId(id)}, {"$set": dictionary}
        )
        return Response("Successfully Updated", status_code=status.HTTP_200_OK)
    except HTTPException as e:
        raise e(status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------
@tasks_router.delete("/{id}")
async def delete_task(id: str):
    """_summary_

    Args:
        id (str):

    Raises:
        e: BadRequest HTTP Exception

    Returns:
        Response: Response Message When Successfully deleted
    """
    try:
        result = await task_collection.delete_one({"_id": ObjectId(id)})
        return Response("Successfully Deleted", status_code=status.HTTP_202_ACCEPTED)

    except HTTPException as e:
        raise e(status.HTTP_400_BAD_REQUEST)
