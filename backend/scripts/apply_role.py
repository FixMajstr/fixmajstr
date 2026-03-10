import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.dependencies.supabase import get_supabase_client
from app.core.common import Role


ROLE_MAP = {
    0: Role.CLIENT.value,
    1: Role.MASTER.value,
    2: Role.ADMIN.value,
}


def parse_args():
    if len(sys.argv) != 3:
        print("Usage: python apply_role.py <email> <role_number>")
        print("Roles: 0=client, 1=master, 2=admin")
        sys.exit(1)

    email = sys.argv[1]

    try:
        role_number = int(sys.argv[2])
    except ValueError:
        print("Error: role_number must be an integer.")
        print("Roles: 0=client, 1=master, 2=admin")
        sys.exit(1)

    if role_number not in ROLE_MAP:
        print(f"Error: invalid role_number '{role_number}'.")
        print("Roles: 0=client, 1=master, 2=admin")
        sys.exit(1)

    return email, ROLE_MAP[role_number]


def update_user_role(email: str, role: Role):
    client = get_supabase_client()

    page = 1
    per_page = 100
    user_found = False

    while True:
        users = client.auth.admin.list_users(page=page, per_page=per_page)

        if not users:
            break

        for user in users:
            if user.email != email:
                continue

            user_found = True
            metadata = user.user_metadata or {}
            updated_metadata = dict(metadata)
            updated_metadata["role"] = role

            print(f"Updating {email} -> role={role}")

            client.auth.admin.update_user_by_id(
                user.id,
                {"user_metadata": updated_metadata},
            )

            print("User updated successfully.")
            return

        if len(users) < per_page:
            break

        page += 1

    if not user_found:
        print(f"User with email '{email}' not found.")
        sys.exit(1)


def main():
    email, role = parse_args()
    update_user_role(email, role)


if __name__ == "__main__":
    main()
