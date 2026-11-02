from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from auth import get_current_user
from services import memory_service

router = APIRouter(prefix="/stats", tags=["Statistics"])


@router.get("/")
def get_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return memory_service.get_stats(db, current_user.id)