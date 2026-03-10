from app.schemas import CurrentUser
from fastapi import APIRouter, Depends
from app.services.test_service import TestService
from app.dependencies.auth import (
    get_current_user,
    require_master_role,
    require_admin_role,
)
from app.schemas.common_io import MessageResponse

"""
prefix="/test" - to pomeni, da bodo vse poti v tem routerju začele s "/test
tags=["Test"] - to je oznaka, ki se uporablja v dokumentaciji API-ja, da se združi vse poti, ki so del tega routerja, pod skupno oznako "Test". To pomaga pri organizaciji in preglednosti dokumentacije.
"""
test_router = APIRouter(prefix="/test", tags=["Test"])


@test_router.get(
    "/healthcheck",
    summary="Test Supabase connection",
    description="Reads one row from the healthcheck table in Supabase.",
    response_description="A list with up to one row from Supabase.",
)
def healthcheck() -> MessageResponse:
    service = TestService()
    return service.get_healthcheck()


@test_router.get(
    "/healthcheck-protected",
    summary="Test Supabase connection withh authentication",
    description="Reads one row from the healthcheck table in Supabase.",
    response_description="A list with up to one row from Supabase.",
)
def healthcheck_protected(
    current_user: CurrentUser = Depends(get_current_user),
) -> MessageResponse:
    service = TestService()
    return service.get_healthcheck()


@test_router.get(
    "/healthcheck-master",
    summary="Test Supabase connection with authorization for master and admin roles",
    description="Reads one row from the healthcheck table in Supabase.",
    response_description="A list with up to one row from Supabase.",
)
def healthcheck_master(
    current_user: CurrentUser = Depends(require_master_role),
) -> MessageResponse:
    service = TestService()
    return service.get_healthcheck()


@test_router.get(
    "/healthcheck-admin",
    summary="Test Supabase connection with authorization for admin role",
    description="Reads one row from the healthcheck table in Supabase.",
    response_description="A list with up to one row from Supabase.",
)
def healthcheck_admin(
    current_user: CurrentUser = Depends(require_admin_role),
) -> MessageResponse:
    service = TestService()
    return service.get_healthcheck()
