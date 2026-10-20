from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import Session, SQLModel, select

from database import engine, get_session
from models import Todo, TodoCreate, TodoUpdate

from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/todos", response_model=list[Todo])
def list_todos(session: Session = Depends(get_session)):
    return session.exec(select(Todo)).all()

@app.post("/todos", response_model=Todo, status_code=201)
def create_todo(data: TodoCreate, session: Session = Depends(get_session)):
    todo = Todo.model_validate(data)
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo

@app.patch("/todos/{todo_id}", response_model=Todo)
def update_todo(todo_id: int, data: TodoUpdate, session: Session = Depends(get_session)):
    todo = session.get(Todo, todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")

    todo.sqlmodel_update(data.model_dump(exclude_unset=True))
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo

@app.delete("/todos/{todo_id}", status_code=204)
def delete_todo(todo_id: int, session: Session = Depends(get_session)):
    todo = session.get(Todo, todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    session.delete(todo)
    session.commit()