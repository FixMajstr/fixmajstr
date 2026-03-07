from fastapi import FastAPI
from app.api.router import api_router

app = FastAPI(title="FixMajstr", version="0.0.1")
app.include_router(api_router)
