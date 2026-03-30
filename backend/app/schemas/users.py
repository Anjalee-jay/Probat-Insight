from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    role: str = Field(default="Player")
    active: bool = True
    analyses: int = Field(default=0, ge=0)


class UserUpdateRequest(UserCreateRequest):
    pass


class ManagedUser(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    initials: str
    active: bool
    analyses: int
    joined: str
    avatar: Optional[str] = None


class UsersListResponse(BaseModel):
    users: list[ManagedUser]


class UserMutationResponse(BaseModel):
    detail: str
    user: ManagedUser


class UserDeleteResponse(BaseModel):
    detail: str
    id: str


class UsersResetResponse(BaseModel):
    detail: str
    deleted_count: int
