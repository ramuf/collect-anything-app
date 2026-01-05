from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from database import get_session
from models import Project
from auth_utils import get_current_user

router = APIRouter(
    prefix="/projects",
    tags=["projects"],
)


@router.get("/", response_model=List[Project])
def list_projects(user=Depends(get_current_user), session: Session = Depends(get_session)):
    stmt = select(Project).where(Project.owner_id == user.id)
    projects = session.exec(stmt).all()
    return projects


@router.post("/", response_model=Project, status_code=status.HTTP_201_CREATED)
def create_project(project: Project, user=Depends(get_current_user), session: Session = Depends(get_session)):
    project.owner_id = user.id
    session.add(project)
    session.commit()
    session.refresh(project)
    return project


@router.put("/{project_id}", response_model=Project)
def update_project(project_id: UUID, data: Project, user=Depends(get_current_user), session: Session = Depends(get_session)):
    proj = session.get(Project, project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    if proj.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    proj.title = data.title
    proj.description = data.description
    proj.settings = data.settings
    session.add(proj)
    session.commit()
    session.refresh(proj)
    return proj


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: UUID, user=Depends(get_current_user), session: Session = Depends(get_session)):
    proj = session.get(Project, project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    if proj.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    session.delete(proj)
    session.commit()
    return None
