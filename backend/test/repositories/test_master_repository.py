import sys
from pathlib import Path

import uuid
from uuid import UUID

import pytest

from app.repositories.master_repository import MastersRepository
from app.schemas import MasterCreate, MasterUpdate
from app.dependencies.supabase import supabase


@pytest.mark.integration
def test_masters_repository_crud_with_real_supabase():
    """
    Real integration test against Supabase.

    Requirements:
    - app.dependencies.supabase.supabase must be initialized with credentials
      that can:
        1) call auth.admin.create_user / delete_user
        2) insert/update/delete/select from public.masters
    - public.masters.user_id must reference auth.users(id)
    """

    repo = MastersRepository()

    created_user_id = None
    created_master_id = None

    random_suffix = uuid.uuid4().hex[:8]
    email = f"test-master-{random_suffix}@example.com"

    try:
        # 1) Create a real auth user
        auth_response = supabase.auth.admin.create_user(
            {
                "email": email,
                "password": "TestPassword123!",
                "email_confirm": True,
            }
        )

        # Depending on supabase-py version, the user may be in .user or .data.user
        user = getattr(auth_response, "user", None)
        if user is None:
            data = getattr(auth_response, "data", None)
            user = getattr(data, "user", None) if data is not None else None

        assert user is not None, "Supabase did not return a created auth user"

        created_user_id = UUID(str(user.id))

        # 2) Check current count
        before = repo.get_all()
        before_count = len(before)

        # 3) Create a master row
        payload = MasterCreate(
            user_id=created_user_id,
            description="Initial description",
            location="Maribor",
            response_time="1 hour",
        )

        created_master = repo.create(payload)
        assert created_master is not None
        assert UUID(created_master["user_id"]) == created_user_id
        assert created_master["description"] == "Initial description"
        assert created_master["location"] == "Maribor"
        assert created_master["response_time"] == "1 hour"

        created_master_id = UUID(created_master["id"])

        # 4) Find by id
        fetched = repo.get_by_id(created_master_id)
        assert fetched is not None
        assert UUID(fetched["id"]) == created_master_id
        assert UUID(fetched["user_id"]) == created_user_id

        # 5) Optional: find by user_id too
        fetched_by_user = repo.get_by_user_id(created_user_id)
        assert fetched_by_user is not None
        assert UUID(fetched_by_user["id"]) == created_master_id

        # 6) Check there is one more row after creating
        after_create = repo.get_all()
        assert len(after_create) == before_count + 1

        # 7) Update
        update_payload = MasterUpdate(
            description="Updated description",
            location="Ljubljana",
            response_time="30 min",
        )

        updated = repo.update(created_master_id, update_payload)
        assert updated is not None
        assert UUID(updated["id"]) == created_master_id
        assert updated["description"] == "Updated description"
        assert updated["location"] == "Ljubljana"
        assert updated["response_time"] == "30 min"

        # 8) Re-read and verify persisted update
        fetched_after_update = repo.get_by_id(created_master_id)
        assert fetched_after_update is not None
        assert fetched_after_update["description"] == "Updated description"
        assert fetched_after_update["location"] == "Ljubljana"
        assert fetched_after_update["response_time"] == "30 min"

        # 9) Delete
        deleted = repo.delete(created_master_id)
        assert deleted is True

        # 10) Verify gone
        fetched_after_delete = repo.get_by_id(created_master_id)
        assert fetched_after_delete is None

        # 11) Count should be back to original
        after_delete = repo.get_all()
        assert len(after_delete) == before_count

        created_master_id = None

    finally:
        # Cleanup auth user even if the test fails halfway through
        if created_master_id is not None:
            try:
                repo.delete(created_master_id)
            except Exception:
                pass

        if created_user_id is not None:
            try:
                supabase.auth.admin.delete_user(str(created_user_id))
            except Exception:
                pass
