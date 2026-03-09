from fastapi import APIRouter
from app.schemas.schemas import UserRegister
from app.services.user_service import UserService

users_router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

@users_router.post("/register")
def register(request: UserRegister):
    service = UserService()
    return service.register_user(request)