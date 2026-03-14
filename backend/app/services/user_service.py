from app.schemas import CurrentUser, UserLogin
from app.schemas.common_db import MasterCreate
from fastapi import HTTPException, Response
from supabase import Client
from app.core.common import Role
from app.repositories.master_repository import MasterRepository


class UserService:
    def __init__(self, supabase: Client):
        self.supabase = supabase
        self._master_repo = MasterRepository()

    def _set_refresh_cookie(self, response: Response, refresh_token: str) -> None:
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False,  # False only in local HTTP development
            samesite="lax",  # "strict" is also okay if your frontend setup allows it
            path="/auth/refresh",  # cookie only sent to refresh endpoint
            max_age=60 * 60 * 24 * 30,  # adjust to your needs
        )

    def _clear_refresh_cookie(self, response: Response) -> None:
        response.delete_cookie(
            key="refresh_token",
            path="/auth/refresh",
        )

    def login_user(self, request_data: UserLogin, response: Response) -> dict:
        try:
            auth_response = self.supabase.auth.sign_in_with_password(
                {
                    "email": request_data.email,
                    "password": request_data.password,
                }
            )
        except Exception as e:
            print(e)
            raise HTTPException(status_code=400, detail="Invalid email or password")

        if not auth_response.user or not auth_response.session:
            raise HTTPException(status_code=400, detail="Login failed")

        session = auth_response.session

        # Store refresh token in secure HttpOnly cookie
        self._set_refresh_cookie(response, session.refresh_token)

        # Return only access token in JSON
        return {
            "message": "User logged in!",
            "user_id": auth_response.user.id,
            "access_token": session.access_token,
            "token_type": "bearer",
            "expires_at": session.expires_at,
            "expires_in": session.expires_in,
        }

    def register_user(self, request_data, role: Role = Role.CLIENT) -> dict:
        try:
            auth_response = self.supabase.auth.sign_up(
                {
                    "email": request_data.email,
                    "password": request_data.password,
                    "options": {
                        "data": {
                            "full_name": request_data.full_name,
                            "role": role.value,
                            "phone": request_data.phone,
                            "avatar_url": request_data.avatar_url,
                        }
                    },
                }
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Register error: {str(e)}")

        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Failed to register user")

        print(role)
        if role == Role.MASTER:
            print("Creating master profile for user", auth_response.user.id)
            self._master_repo.create(
                payload=MasterCreate(
                    user_id=auth_response.user.id,
                    location="",
                    description="",
                    avg_rating=0.0,
                    response_time="",
                )
            )

        return {
            "message": "User registered!",
            "user_id": auth_response.user.id,
        }

    def refresh_access_token(self, refresh_token: str, response: Response) -> dict:
        if not refresh_token:
            raise HTTPException(status_code=401, detail="Missing refresh token")

        try:
            auth_response = self.supabase.auth.refresh_session(refresh_token)
        except Exception:
            raise HTTPException(
                status_code=401, detail="Invalid or expired refresh token"
            )

        if not auth_response.session or not auth_response.user:
            raise HTTPException(status_code=401, detail="Failed to refresh session")

        session = auth_response.session

        # rotate refresh token
        self._set_refresh_cookie(response, session.refresh_token)

        return {
            "access_token": session.access_token,
            "token_type": "bearer",
            "expires_at": session.expires_at,
            "expires_in": session.expires_in,
            "user_id": auth_response.user.id,
        }

    def logout_user(self, response: Response) -> dict:
        try:
            self.supabase.auth.sign_out(scope="local")
        except Exception:
            pass  # don't block logout if Supabase fails

        self._clear_refresh_cookie(response)

        return {"message": "Logged out successfully"}

    def get_me(self, current_user: CurrentUser) -> CurrentUser:
        return current_user
