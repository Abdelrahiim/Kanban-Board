from typing import List, Optional
from bson import ObjectId
from pydantic import BaseModel, Field


class Task(BaseModel):
    column_id:str
    content:str

class TaskRequest(BaseModel):
    content:str


class Column(BaseModel):
    title:str
    