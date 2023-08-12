from typing import List, Optional
from bson import ObjectId
from pydantic import BaseModel, Field


class Task(BaseModel):
    content:str

class Column(BaseModel):
    title:str
    