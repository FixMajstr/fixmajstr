from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
from app.services.inquiry_service import InquiryService
from app.schemas import (
    CurrentUser, 
    InquiryCreate, 
    InquiryResponse, 
    InquiryListResponse, 
    InquiryStatusUpdate
)
from app.dependencies.auth import get_current_user, require_master_role
from typing import Dict, Any

inquiry_router = APIRouter(prefix="/inquiries", tags=["Inquiries"])


@inquiry_router.post(
    "/",
    response_model=Dict[str, Any],
    summary="Send inquiry to master",
    description="Create a new inquiry from client to master."
)
def send_inquiry(
    inquiry_data: InquiryCreate,
    current_user: CurrentUser = Depends(get_current_user)
):
    service = InquiryService()
    return service.create_inquiry(inquiry_data, current_user)


@inquiry_router.get(
    "/my-inquiries",
    response_model=InquiryListResponse,
    summary="Get client's inquiries",
    description="Get all inquiries sent by the current client."
)
def get_my_inquiries(
    current_user: CurrentUser = Depends(get_current_user)
):
    service = InquiryService()
    return service.get_client_inquiries(current_user)


@inquiry_router.get(
    "/received",
    response_model=InquiryListResponse,
    summary="Get received inquiries (for masters)",
    description="Get all inquiries received by the current master."
)
def get_received_inquiries(
    current_user: CurrentUser = Depends(require_master_role)
):
    service = InquiryService()
    return service.get_master_inquiries(current_user)


@inquiry_router.get(
    "/{inquiry_id}",
    response_model=InquiryResponse,
    summary="Get inquiry by ID",
    description="Get a specific inquiry by its ID."
)
def get_inquiry(
    inquiry_id: UUID,
    current_user: CurrentUser = Depends(get_current_user)
):
    service = InquiryService()
    return service.get_inquiry_by_id(inquiry_id, current_user)


@inquiry_router.patch(
    "/{inquiry_id}/status",
    response_model=Dict[str, Any],
    summary="Update inquiry status",
    description="Update the status of an inquiry."
)
def update_inquiry_status(
    inquiry_id: UUID,
    status_update: InquiryStatusUpdate,
    current_user: CurrentUser = Depends(get_current_user)
):
    service = InquiryService()
    return service.update_inquiry_status(inquiry_id, status_update, current_user)