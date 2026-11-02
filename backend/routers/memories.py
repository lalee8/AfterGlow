
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from auth import get_current_user
import schemas
from services import memory_service

router = APIRouter(prefix="/memories", tags=["Memories"])


@router.post("/", response_model=schemas.MemoryResponse)
def create_memory(
    memory: schemas.MemoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return memory_service.create_memory(
        db, memory, current_user.id
    )


@router.get("/", response_model=list[schemas.MemoryResponse])
def get_memories(
    search: str = None,
    mood: str = None,
    sort: str = "newest",
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return memory_service.get_memories(
        db, current_user.id, search, mood, sort, skip, limit
    )


@router.get("/{memory_id}", response_model=schemas.MemoryResponse)
def get_memory(
    memory_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return memory_service.get_memory(
        db, memory_id, current_user.id
    )


@router.put("/{memory_id}", response_model=schemas.MemoryResponse)
def update_memory(
    memory_id: int,
    updated_memory: schemas.MemoryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return memory_service.update_memory(
        db, memory_id, updated_memory, current_user.id
    )


@router.delete("/{memory_id}")
def delete_memory(
    memory_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return memory_service.delete_memory(
        db, memory_id, current_user.id
    )
