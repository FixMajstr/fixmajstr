from fastapi import APIRouter
from app.schemas.schemas import UserLogin
from app.services.user_service import UserService

users_router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

@users_router.post("/login")
def login(request: UserLogin):
    service = UserService()
    return service.login_user(request)