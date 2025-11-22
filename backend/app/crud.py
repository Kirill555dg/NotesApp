from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


# User CRUD operations
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


def create_user(db: Session, user: schemas.UserCreate):
    logger.info(f"Creating new user: {user.username}")
    db_user = models.User(
        username=user.username,
        password=user.password,  # Сохраняем пароль как есть
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    logger.info(f"User created successfully: {user.username}")
    return db_user


def authenticate_user(db: Session, username: str, password: str):
    logger.info(f"Authenticating user: {username}")
    user = get_user_by_username(db, username)
    if not user:
        logger.warning(f"Authentication failed: user {username} not found")
        return False
    if user.password != password:  # Простое сравнение паролей
        logger.warning(f"Authentication failed: invalid password for user {username}")
        return False
    logger.info(f"User authenticated successfully: {username}")
    return user


# Note CRUD operations (без изменений)
def get_notes(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    logger.info(f"Fetching notes for user_id: {user_id}, skip: {skip}, limit: {limit}")
    notes = (
        db.query(models.Note)
        .filter(models.Note.user_id == user_id)
        .order_by(models.Note.updated_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    logger.info(f"Found {len(notes)} notes for user_id: {user_id}")
    return notes


def get_note(db: Session, note_id: int, user_id: int):
    logger.info(f"Fetching note {note_id} for user_id: {user_id}")
    note = db.query(models.Note).filter(models.Note.id == note_id, models.Note.user_id == user_id).first()
    if note:
        logger.info(f"Note {note_id} found for user_id: {user_id}")
    else:
        logger.warning(f"Note {note_id} not found for user_id: {user_id}")
    return note


def create_note(db: Session, note: schemas.NoteCreate, user_id: int):
    logger.info(f"Creating note for user_id: {user_id}")
    db_note = models.Note(title=note.title, content=note.content, tags=note.tags, user_id=user_id)
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    logger.info(f"Note created successfully with id: {db_note.id} for user_id: {user_id}")
    return db_note


def update_note(db: Session, note_id: int, note: schemas.NoteUpdate, user_id: int):
    logger.info(f"Updating note {note_id} for user_id: {user_id}")
    db_note = get_note(db, note_id, user_id)
    if db_note:
        db_note.title = note.title
        db_note.content = note.content
        db_note.tags = note.tags
        db_note.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_note)
        logger.info(f"Note {note_id} updated successfully for user_id: {user_id}")
    else:
        logger.warning(f"Note {note_id} not found for update for user_id: {user_id}")
    return db_note


def delete_note(db: Session, note_id: int, user_id: int):
    logger.info(f"Deleting note {note_id} for user_id: {user_id}")
    db_note = get_note(db, note_id, user_id)
    if db_note:
        db.delete(db_note)
        db.commit()
        logger.info(f"Note {note_id} deleted successfully for user_id: {user_id}")
    else:
        logger.warning(f"Note {note_id} not found for deletion for user_id: {user_id}")
    return db_note
