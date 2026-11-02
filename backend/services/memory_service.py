
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

import models
import schemas


def create_memory(db: Session, memory: schemas.MemoryCreate, user_id: int):
    new_memory = models.Memory(
        title=memory.title,
        description=memory.description,
        mood=memory.mood,
        user_id=user_id
    )

    db.add(new_memory)
    db.commit()
    db.refresh(new_memory)

    return new_memory


def get_memories(
    db: Session,
    user_id: int,
    search: str = None,
    mood: str = None,
    sort: str = "newest",
    skip: int = 0,
    limit: int = 10
):
    query = db.query(models.Memory).filter(
        models.Memory.user_id == user_id
    )

    if search:
        query = query.filter(
            or_(
                models.Memory.title.contains(search),
                models.Memory.description.contains(search)
            )
        )

    if mood:
        query = query.filter(models.Memory.mood == mood)

    if sort == "newest":
        query = query.order_by(models.Memory.created_at.desc())
    elif sort == "oldest":
        query = query.order_by(models.Memory.created_at.asc())
    else:
        raise HTTPException(
            status_code=400,
            detail="Sort must be 'newest' or 'oldest'"
        )

    return query.offset(skip).limit(limit).all()


def get_memory(db: Session, memory_id: int, user_id: int):
    memory = db.query(models.Memory).filter(
        models.Memory.id == memory_id,
        models.Memory.user_id == user_id
    ).first()

    if memory is None:
        raise HTTPException(status_code=404, detail="Memory not found")

    return memory


def update_memory(
    db: Session,
    memory_id: int,
    updated_memory: schemas.MemoryUpdate,
    user_id: int
):
    memory = get_memory(db, memory_id, user_id)

    memory.title = updated_memory.title
    memory.description = updated_memory.description
    memory.mood = updated_memory.mood

    db.commit()
    db.refresh(memory)

    return memory


def delete_memory(db: Session, memory_id: int, user_id: int):
    memory = get_memory(db, memory_id, user_id)

    db.delete(memory)
    db.commit()

    return {"message": "Memory deleted successfully"}


def get_stats(db: Session, user_id: int):
    total_memories = db.query(models.Memory).filter(
        models.Memory.user_id == user_id
    ).count()

    moods = db.query(
        models.Memory.mood,
        func.count(models.Memory.id)
    ).filter(
        models.Memory.user_id == user_id
    ).group_by(models.Memory.mood).all()

    return {
        "total_memories": total_memories,
        "mood_statistics": {
            mood: count for mood, count in moods
        }
    }
