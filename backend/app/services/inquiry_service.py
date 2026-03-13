from app.repositories.inquiries_repository import InquiriesRepository
from app.repositories.master_repository import MastersRepository
from app.schemas import InquiryCreate, InquiryResponse, InquiryListResponse, InquiryStatusUpdate, InquiryUpdate
from app.schemas.common_io import MessageResponse
from app.schemas import CurrentUser
from fastapi import HTTPException
from uuid import UUID
from typing import List, Dict, Any
from datetime import datetime


class InquiryService:
    def __init__(self):
        self.repository = InquiriesRepository()
        self.masters_repository = MastersRepository()

    def create_inquiry(self, inquiry_data: InquiryCreate, current_user: CurrentUser) -> Dict[str, Any]:
        """Create a new inquiry from a client to a master"""
        try:
            if current_user.role not in ["client", "admin"]:
                raise HTTPException(status_code=403, detail="Only clients can create inquiries")

            inquiry_payload = InquiryCreate(
                client_id=current_user.id,
                master_id=inquiry_data.master_id,
                message=inquiry_data.message,
                status="pending"
            )

            inquiry = self.repository.create(inquiry_payload)

            return {
                "message": "Inquiry created successfully",
                "inquiry": self._format_inquiry_response(inquiry)
            }
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=500, detail=f"Failed to create inquiry: {str(e)}")

    def get_client_inquiries(self, current_user: CurrentUser) -> InquiryListResponse:
        """Get all inquiries for the current client"""
        try:
            if current_user.role not in ["client", "admin"]:
                raise HTTPException(status_code=403, detail="Only clients can view their inquiries")

            inquiries = self.repository.get_by_client_id(current_user.id)
            formatted_inquiries = [self._format_inquiry_response(inquiry) for inquiry in inquiries]

            return InquiryListResponse(
                inquiries=formatted_inquiries,
                total=len(formatted_inquiries)
            )
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=500, detail=f"Failed to get inquiries: {str(e)}")

    def get_master_inquiries(self, current_user: CurrentUser) -> InquiryListResponse:
        """Get all inquiries for the current master"""
        try:
            if current_user.role not in ["master", "admin"]:
                raise HTTPException(status_code=403, detail="Only masters can view inquiries sent to them")

            master = self.masters_repository.get_by_user_id(current_user.id)
            if not master:
                raise HTTPException(status_code=404, detail="Master profile not found")

            inquiries = self.repository.get_by_master_id(UUID(master["id"]))
            formatted_inquiries = [self._format_inquiry_response(inquiry) for inquiry in inquiries]

            return InquiryListResponse(
                inquiries=formatted_inquiries,
                total=len(formatted_inquiries)
            )
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=500, detail=f"Failed to get inquiries: {str(e)}")

    def update_inquiry_status(self, inquiry_id: UUID, status_update: InquiryStatusUpdate, current_user: CurrentUser) -> Dict[str, Any]:
        """Update inquiry status (typically used by masters to respond)"""
        try:
            inquiry = self.repository.get_by_id(inquiry_id)
            if not inquiry:
                raise HTTPException(status_code=404, detail="Inquiry not found")

            if current_user.role == "master":
                master = self.masters_repository.get_by_user_id(current_user.id)
                if not master or str(master["id"]) != str(inquiry["master_id"]):
                    raise HTTPException(status_code=403, detail="You can only update inquiries sent to you")
            elif current_user.role == "client":
                if str(inquiry["client_id"]) != str(current_user.id):
                    raise HTTPException(status_code=403, detail="You can only update your own inquiries")
            elif current_user.role != "admin":
                raise HTTPException(status_code=403, detail="Insufficient permissions")

            update_payload = InquiryUpdate(status=status_update.status)
            updated_inquiry = self.repository.update(inquiry_id, update_payload)

            return {
                "message": "Inquiry status updated successfully",
                "inquiry": self._format_inquiry_response(updated_inquiry)
            }
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=500, detail=f"Failed to update inquiry: {str(e)}")

    def get_inquiry_by_id(self, inquiry_id: UUID, current_user: CurrentUser) -> InquiryResponse:
        """Get a specific inquiry by ID"""
        try:
            inquiry = self.repository.get_by_id(inquiry_id)
            if not inquiry:
                raise HTTPException(status_code=404, detail="Inquiry not found")

            if current_user.role not in ["admin"]:
                is_client = str(inquiry["client_id"]) == str(current_user.id)

                is_master = False
                if current_user.role == "master":
                    master = self.masters_repository.get_by_user_id(current_user.id)
                    is_master = master and str(master["id"]) == str(inquiry["master_id"])

                if not (is_client or is_master):
                    raise HTTPException(status_code=403, detail="You can only view your own inquiries")

            return self._format_inquiry_response(inquiry)
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=500, detail=f"Failed to get inquiry: {str(e)}")

    def _format_inquiry_response(self, inquiry: Dict[str, Any]) -> InquiryResponse:
        """Format database inquiry data to InquiryResponse schema"""
        return InquiryResponse(
            id=UUID(inquiry["id"]),
            created_at=datetime.fromisoformat(inquiry["created_at"].replace("Z", "+00:00")) if isinstance(inquiry["created_at"], str) else inquiry["created_at"],
            client_id=UUID(inquiry["client_id"]),
            master_id=UUID(inquiry["master_id"]),
            message=inquiry.get("message"),
            status=inquiry.get("status")
        )