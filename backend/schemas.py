
from pydantic import BaseModel, Field
from datetime import datetime


class MemoryCreate(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    description: str
    mood: str


class MemoryResponse(BaseModel):
    id: int
    title: str
    description: str
    mood: str
    created_at: datetime

    model_config = {"from_attributes": True}

class MemoryUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    description: str
    mood: str

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: str
    password: str = Field(min_length=8)


class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str
