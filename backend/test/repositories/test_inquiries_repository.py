import sys
from pathlib import Path
from uuid import UUID
import uuid

import pytest

ROOT_DIR = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT_DIR))

from app.dependencies.supabase import supabase
from app.repositories.master_repository import MastersRepository
from app.repositories.inquiries_repository import InquiriesRepository
from app.schemas import MasterCreate, InquiryCreate, InquiryUpdate


@pytest.mark.integration
def test_inquiries_repository_crud_with_real_supabase():
    masters_repo = MastersRepository()
    inquiries_repo = InquiriesRepository()

    created_master_user_id = None
    created_client_user_id = None
    created_master_id = None
    created_inquiry_id = None

    suffix = uuid.uuid4().hex[:8]
    master_email = f"test-master-{suffix}@example.com"
    client_email = f"test-client-{suffix}@example.com"

    try:
        # Create auth user for master owner
        master_auth_response = supabase.auth.admin.create_user(
            {
                "email": master_email,
                "password": "TestPassword123!",
                "email_confirm": True,
            }
        )

        master_user = getattr(master_auth_response, "user", None)
        if master_user is None:
            data = getattr(master_auth_response, "data", None)
            master_user = getattr(data, "user", None) if data is not None else None

        assert master_user is not None, "Failed to create master auth user"
        created_master_user_id = UUID(str(master_user.id))

        # Create auth user for client
        client_auth_response = supabase.auth.admin.create_user(
            {
                "email": client_email,
                "password": "TestPassword123!",
                "email_confirm": True,
            }
        )

        client_user = getattr(client_auth_response, "user", None)
        if client_user is None:
            data = getattr(client_auth_response, "data", None)
            client_user = getattr(data, "user", None) if data is not None else None

        assert client_user is not None, "Failed to create client auth user"
        created_client_user_id = UUID(str(client_user.id))

        # Create master row
        master_payload = MasterCreate(
            user_id=created_master_user_id,
            description="Test master for inquiries",
            location="Maribor",
            response_time="1 hour",
        )

        created_master = masters_repo.create(master_payload)
        assert created_master is not None

        created_master_id = UUID(created_master["id"])
        assert UUID(created_master["user_id"]) == created_master_user_id

        # Count inquiries before create
        before_all = inquiries_repo.get_all()
        before_count = len(before_all)

        # Create inquiry
        inquiry_payload = InquiryCreate(
            client_id=created_client_user_id,
            master_id=created_master_id,
            message="Hello, I need help with bathroom tiles.",
            status="pending",
        )

        created_inquiry = inquiries_repo.create(inquiry_payload)
        assert created_inquiry is not None

        created_inquiry_id = UUID(created_inquiry["id"])
        assert UUID(created_inquiry["client_id"]) == created_client_user_id
        assert UUID(created_inquiry["master_id"]) == created_master_id
        assert created_inquiry["message"] == "Hello, I need help with bathroom tiles."
        assert created_inquiry["status"] == "pending"
        assert "created_at" in created_inquiry

        # Find by id
        fetched = inquiries_repo.get_by_id(created_inquiry_id)
        assert fetched is not None
        assert UUID(fetched["id"]) == created_inquiry_id
        assert UUID(fetched["client_id"]) == created_client_user_id
        assert UUID(fetched["master_id"]) == created_master_id

        # Count after create
        after_create = inquiries_repo.get_all()
        assert len(after_create) == before_count + 1

        # Get by master_id
        master_inquiries = inquiries_repo.get_by_master_id(created_master_id)
        assert any(UUID(item["id"]) == created_inquiry_id for item in master_inquiries)

        # Get by client_id
        client_inquiries = inquiries_repo.get_by_client_id(created_client_user_id)
        assert any(UUID(item["id"]) == created_inquiry_id for item in client_inquiries)

        # Update inquiry
        update_payload = InquiryUpdate(
            message="Updated message: I also need kitchen tiles fixed.",
            status="accepted",
        )

        updated = inquiries_repo.update(created_inquiry_id, update_payload)
        assert updated is not None
        assert UUID(updated["id"]) == created_inquiry_id
        assert updated["message"] == "Updated message: I also need kitchen tiles fixed."
        assert updated["status"] == "accepted"

        # Re-read and verify
        fetched_after_update = inquiries_repo.get_by_id(created_inquiry_id)
        assert fetched_after_update is not None
        assert (
            fetched_after_update["message"]
            == "Updated message: I also need kitchen tiles fixed."
        )
        assert fetched_after_update["status"] == "accepted"

        # Delete inquiry
        deleted = inquiries_repo.delete(created_inquiry_id)
        assert deleted is True

        # Verify gone
        fetched_after_delete = inquiries_repo.get_by_id(created_inquiry_id)
        assert fetched_after_delete is None

        # Count back to original
        after_delete = inquiries_repo.get_all()
        assert len(after_delete) == before_count

        created_inquiry_id = None

    finally:
        # Cleanup inquiry if test failed before delete
        if created_inquiry_id is not None:
            try:
                inquiries_repo.delete(created_inquiry_id)
            except Exception:
                pass

        # Cleanup master row
        if created_master_id is not None:
            try:
                masters_repo.delete(created_master_id)
            except Exception:
                pass

        # Cleanup auth users
        if created_client_user_id is not None:
            try:
                supabase.auth.admin.delete_user(str(created_client_user_id))
            except Exception:
                pass

        if created_master_user_id is not None:
            try:
                supabase.auth.admin.delete_user(str(created_master_user_id))
            except Exception:
                pass
