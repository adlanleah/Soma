from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import health, embed, tutor, generate
from app.core.config import settings

app = FastAPI(title="Soma AI Service", version="0.1.0")

# NestJS will be the only caller of this service in production,
# but keep CORS open in dev for direct testing via browser/tools.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["health"])
app.include_router(embed.router, tags=["embed"])
app.include_router(tutor.router, tags=["tutor"])
app.include_router(generate.router, tags=["generate"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.port, reload=True)