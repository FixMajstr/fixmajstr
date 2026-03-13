from app.core.common import Role
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


def _requires_role(*allowed_roles: str):
    def role_dependency(current_user: CurrentUser = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Forbidden")
        return current_user

    return role_dependency


require_master_role = _requires_role(Role.MASTER.value, Role.ADMIN.value)
require_admin_role = _requires_role(Role.ADMIN.value)
