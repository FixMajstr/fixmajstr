from app.schemas.schemas import CurrentUser
from fastapi import APIRouter, Depends
from app.schemas.test import HelloResponse
from app.services.test_service import TestService
from app.dependencies.auth import get_current_user

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
def healthcheck() -> HelloResponse:
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
) -> HelloResponse:
    service = TestService()
    return service.get_healthcheck()
