from fastapi import APIRouter

from app.api.routes.auth_router import AuthRouter
from app.api.routes.inquiry_router import inquiry_router
from app.api.routes.masters import master_router
from app.api.routes.ratings import rating_router
from app.api.routes.test_router import test_router

api_router = APIRouter()

auth_router = AuthRouter().router

api_router.include_router(test_router)
api_router.include_router(auth_router)
api_router.include_router(inquiry_router)
api_router.include_router(master_router)
api_router.include_router(rating_router)
