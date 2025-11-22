from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.responses import HTMLResponse, JSONResponse
from sqlalchemy.orm import Session
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from pathlib import Path
import logging
import sys

from app import models, schemas, crud, auth
from app.database import get_db, create_tables
from app.dependencies import get_current_user

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout), logging.FileHandler("app.log")],
)
logger = logging.getLogger(__name__)

# Создаем таблицы при старте
create_tables()

app = FastAPI(
    title="Notes API",
    description="""
    Простое и эффективное API для управления персональными заметками.

    ## Особенности:

    * **Аутентификация** - безопасный доступ к заметкам
    * **Теги** - организуйте заметки с помощью тегов
    * **Полный CRUD** - создание, чтение, обновление, удаление заметок

    ## Аутентификация:

    1. Зарегистрируйтесь через `/register`
    2. Войдите через `/login` чтобы получить JWT токен
    3. Используйте токен в заголовках: `Authorization: Bearer <your_token>`
    """,
    version="2.0.0",
    contact={
        "name": "Notes API Support",
    },
    license_info={
        "name": "MIT",
    },
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=[
        {
            "name": "auth",
            "description": "Регистрация и аутентификация",
        },
        {
            "name": "notes",
            "description": "Операции с заметками",
        },
    ],
)


# Middleware для логирования запросов
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    try:
        response = await call_next(request)
        logger.info(f"Response: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Request error: {e}")
        raise


# Обработчик ошибок валидации
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error for {request.url}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "body": exc.body},
    )


# Глобальный обработчик ошибок
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error for {request.url}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )


# Настройка CORS для фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def read_html_template(template_name: str) -> str:
    """Читает HTML шаблон из папки templates"""
    template_path = Path(__file__).parent / "templates" / template_name
    return template_path.read_text(encoding="utf-8")


@app.get("/")
async def root():
    logger.info("Root endpoint accessed")
    return {
        "message": "Notes API v2 - Добро пожаловать!",
        "version": "2.0.0",
        "authentication": "JWT Bearer Token",
        "endpoints": {"register": "/register", "login": "/login", "notes": "/notes"},
        "documentation": {
            "swagger": "/docs",
            "redoc": "/redoc",
            "stoplight_elements": "/elements",
        },
    }


# Stoplight Elements документация
@app.get("/elements", response_class=HTMLResponse)
async def elements_docs():
    logger.info("Stoplight Elements documentation accessed")
    return read_html_template("elements.html")


# Аутентификация
@app.post("/register", response_model=schemas.User, tags=["auth"])
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Регистрация нового пользователя"""
    logger.info(f"Registration attempt for username: {user.username}")

    # Проверяем существование пользователя
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        logger.warning(f"Registration failed: username '{user.username}' already exists")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    # Создаем пользователя
    try:
        new_user = crud.create_user(db=db, user=user)
        logger.info(f"User '{user.username}' registered successfully")
        return new_user
    except Exception as e:
        logger.error(f"Registration error for '{user.username}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create user",
        )


@app.post("/login", response_model=schemas.Token, tags=["auth"])
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    """Аутентификация пользователя и получение токена"""
    logger.info(f"Login attempt for user: {user.username}")

    authenticated_user = crud.authenticate_user(db, user.username, user.password)
    if not authenticated_user:
        logger.warning(f"Login failed for user: {user.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Создаем токен
    access_token = auth.create_access_token(data={"sub": authenticated_user.username})

    logger.info(f"User '{user.username}' logged in successfully")
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": authenticated_user.id,
        "username": authenticated_user.username,
    }


# Эндпоинты для заметок (требуют аутентификацию) - УБИРАЕМ СЛЕШИ В КОНЦЕ
@app.post("/notes", response_model=schemas.Note, tags=["notes"])
def create_note(
    note: schemas.NoteCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Создать новую заметку"""
    logger.info(f"User '{current_user.username}' creating new note")
    return crud.create_note(db=db, note=note, user_id=current_user.id)


@app.get("/notes", response_model=List[schemas.Note], tags=["notes"])
def read_notes(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Получить список заметок текущего пользователя"""
    logger.info(f"User '{current_user.username}' fetching notes (skip: {skip}, limit: {limit})")
    return crud.get_notes(db, user_id=current_user.id, skip=skip, limit=limit)


@app.get("/notes/{note_id}", response_model=schemas.Note, tags=["notes"])
def read_note(
    note_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Получить конкретную заметку по ID"""
    logger.info(f"User '{current_user.username}' fetching note {note_id}")

    db_note = crud.get_note(db, note_id=note_id, user_id=current_user.id)
    if db_note is None:
        logger.warning(f"Note {note_id} not found for user '{current_user.username}'")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Заметка не найдена")

    return db_note


@app.put("/notes/{note_id}", response_model=schemas.Note, tags=["notes"])
def update_note(
    note_id: int,
    note: schemas.NoteUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Обновить существующую заметку"""
    logger.info(f"User '{current_user.username}' updating note {note_id}")

    db_note = crud.update_note(db, note_id=note_id, note=note, user_id=current_user.id)
    if db_note is None:
        logger.warning(f"Note {note_id} not found for update by user '{current_user.username}'")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Заметка не найдена")

    return db_note


@app.delete("/notes/{note_id}", tags=["notes"])
def delete_note(
    note_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Удалить заметку"""
    logger.info(f"User '{current_user.username}' deleting note {note_id}")

    db_note = crud.delete_note(db, note_id=note_id, user_id=current_user.id)
    if db_note is None:
        logger.warning(f"Note {note_id} not found for deletion by user '{current_user.username}'")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Заметка не найдена")

    return {"message": "Заметка удалена"}


# Health check endpoint
@app.get("/health")
async def health_check():
    """Проверка состояния API"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.0",
    }


if __name__ == "__main__":
    import uvicorn

    logger.info("Starting Notes API v2 server")
    uvicorn.run(app, host="0.0.0.0", port=12345, log_level="info", access_log=True)
