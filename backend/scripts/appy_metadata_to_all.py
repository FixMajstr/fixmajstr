import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.dependencies.supabase import get_supabase_client


DEFAULT_METADATA = {
    "full_name": "John Doe",
    "role": "client",
    "phone": "",
    "avatar_url": None,
}


def merge_metadata(existing):
    """
    Add missing metadata fields.
    """
    existing = existing or {}
    updated = dict(existing)
    changed = False

    for key, value in DEFAULT_METADATA.items():
        if key not in updated or not updated[key]:
            updated[key] = value
            changed = True

    return updated, changed


def main():
    client = get_supabase_client()

    page = 1
    per_page = 100

    while True:
        users = client.auth.admin.list_users(page=page, per_page=per_page)
        if not users:
            break

        for user in users:
            metadata = user.user_metadata

            new_metadata, changed = merge_metadata(metadata)

            if not changed:
                print(f"Skipping {user.email} (metadata OK)")
                continue

            print(f"Updating {user.email}")

            client.auth.admin.update_user_by_id(
                user.id, {"user_metadata": new_metadata}
            )

        if len(users) < per_page:
            break

        page += 1


if __name__ == "__main__":
    main()
