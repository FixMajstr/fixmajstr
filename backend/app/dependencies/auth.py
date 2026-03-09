from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.dependencies.supabase import get_supabase_client
from app.schemas import CurrentUser

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase=Depends(get_supabase_client),
) -> CurrentUser:
    token = credentials.credentials

    if not token:
        raise HTTPException(status_code=401, detail="Missing access token")

    try:
        user_response = supabase.auth.get_user(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired access token")

    if not user_response or not user_response.user:
        raise HTTPException(status_code=401, detail="User not found")

    return CurrentUser(
        id=user_response.user.id,
        email=user_response.user.email,
        role=user_response.user.user_metadata.get("role"),
        phone=user_response.user.user_metadata.get("phone"),
        full_name=user_response.user.user_metadata.get("full_name"),
        avatar_url=user_response.user.user_metadata.get("avatar_url"),
    )
