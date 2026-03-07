from fastapi import APIRouter
from app.api.routes.test import test_router
#from app.api.routes import auth, users, items

api_router = APIRouter()

api_router.include_router(test_router)