from bson import ObjectId
from fastapi import APIRouter, HTTPException
from api.db import add_column, client, delete_column, fetch_all, return_model, update_column
from api.schema import Column
from api.db import db

col_router = APIRouter(prefix="/api/columns", tags=["Columns"])


@col_router.get("/{id}")
async def get_unique(id):
    pipeline = [
        {
            "$lookup": {
                "from": "task",
                "localField": "tasks_ids",
                "foreignField": "_id",
                "as": "Tasks",
            }
        },
        {"$match": {"_id": ObjectId(id)}},
    ]

    colum = await db.command("aggregate","column",pipeline=pipeline,explain=False)
    return return_model(colum["cursor"]['firstBatch'][0])
    





@col_router.post("/")
async def create_column(column: Column):
    new_col = await add_column(column.model_dump())
    return new_col


@col_router.put("/{id}")
async def update_column_view(id: str, column: Column):
    updated_column = await update_column(id, column.model_dump())
    return updated_column


@col_router.delete("/{id}")
async def delete_column_view(id: str):
    try:
        await delete_column(id)
        return {"msg": "Successful Deletion "}
    except:
        raise HTTPException(403, "Bad Request")
