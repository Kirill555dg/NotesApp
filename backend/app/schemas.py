from pydantic import BaseModel, Field
from datetime import datetime
from typing import List


# Схемы для пользователей
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, examples=["john_doe"])


class UserCreate(UserBase):
    password: str = Field(..., examples=["password123"])


class UserLogin(UserBase):
    password: str = Field(..., examples=["password123"])


class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class NoteBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, examples=["Моя заметка"])
    content: str = Field(..., description="Текст заметки", examples=["Купить молоко и хлеб"])
    tags: List[str] = Field(default_factory=list, description="Список тегов", examples=["покупки", "важно"])


class NoteCreate(NoteBase):
    pass


class NoteUpdate(NoteBase):
    pass


class Note(NoteBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Схемы для токенов
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    username: str
