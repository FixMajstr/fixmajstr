from app.dependencies.auth import get_current_user, require_master_role
from fastapi import APIRouter, Response, Header, Depends
from app.schemas import (
    AuthResponse,
    CurrentUser,
    ErrorResponse,
    RefreshResponse,
    RegisterResponse,
    UserLogin,
    MessageResponse,
    UserRegister,
)
from app.services.user_service import UserService
from app.dependencies.supabase import supabase
from typing import Annotated
from app.core.common import Role


class AuthRouter:
    def __init__(self):
        self.router = APIRouter(prefix="/auth", tags=["Auth"])
        self.service = UserService(supabase=supabase)

        self.router.add_api_route(
            "/login",
            self.login,
            methods=["POST"],
            response_model=AuthResponse,
            responses={
                400: {
                    "model": ErrorResponse,
                    "description": "Invalid email or password",
                },
                500: {"model": ErrorResponse, "description": "Internal server error"},
            },
        )

        self.router.add_api_route(
            "/register",
            self.register,
            methods=["POST"],
            response_model=RegisterResponse,
            responses={
                400: {"model": ErrorResponse, "description": "Registration failed"},
                500: {"model": ErrorResponse, "description": "Internal server error"},
            },
        )

        self.router.add_api_route(
            "/register-master",
            self.register,
            methods=["POST"],
            response_model=RegisterResponse,
            responses={
                400: {"model": ErrorResponse, "description": "Registration failed"},
                500: {"model": ErrorResponse, "description": "Internal server error"},
            },
        )

        self.router.add_api_route(
            "/refresh",
            self.refresh,
            methods=["POST"],
            response_model=RefreshResponse,
            responses={
                401: {
                    "model": ErrorResponse,
                    "description": "Invalid or missing refresh token",
                },
                500: {"model": ErrorResponse, "description": "Internal server error"},
            },
        )

        self.router.add_api_route(
            "/logout",
            self.logout,
            methods=["POST"],
            response_model=MessageResponse,
            responses={
                500: {"model": ErrorResponse, "description": "Internal server error"},
            },
        )

        self.router.add_api_route(
            "/me",
            self.me,
            methods=["GET"],
            response_model=CurrentUser,
            responses={
                401: {
                    "model": ErrorResponse,
                    "description": "Missing, invalid, or expired access token",
                },
                500: {"model": ErrorResponse, "description": "Internal server error"},
            },
        )

    def login(self, request: UserLogin, response: Response) -> AuthResponse:
        return self.service.login_user(request, response)

    def register(self, request: UserRegister) -> RegisterResponse:
        return self.service.register_user(request)

    def register_master(self, request: UserRegister) -> RegisterResponse:
        role = Role.MASTER
        return self.service.register_user(request, role=role)

    def refresh(
        self,
        refresh_token: Annotated[str, Header(description="Refresh token")],
        response: Response,
    ) -> RefreshResponse:
        return self.service.refresh_access_token(refresh_token, response)

    def logout(self, response: Response) -> MessageResponse:
        return self.service.logout_user(response)

    def me(
        self,
        current_user: CurrentUser = Depends(get_current_user),
    ) -> CurrentUser:
        return self.service.get_me(current_user)
