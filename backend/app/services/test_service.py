from app.repositories.test_repository import TestRepository


class TestService:
    def __init__(self):
        self.repository = TestRepository()

    def get_healthcheck(self):
        return self.repository.get_healthcheck()