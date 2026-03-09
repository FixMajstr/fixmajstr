from app.schemas.schemas import UserLogin, UserRegister
from app.integrations.supabase import supabase
from fastapi import HTTPException

class UserService:
    def login_user(self, request: UserLogin) -> dict:
        try:
            auth_response = supabase.auth.sign_in_with_password({
                "email": request.email,
                "password": request.password
            })

            return {
                "message": "User logged in!",
                "user_id": auth_response.user.id,
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid email or password")
    def register_user(self, request: UserRegister) -> dict:
        try:
            auth_response = supabase.auth.sign_up({
                "email": request.email,
                "password": request.password,
            })
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Register error: {str(e)}")

        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Failed to register user")

        return {
            "message": "User registered!",
            "user_id": auth_response.user.id
        }
