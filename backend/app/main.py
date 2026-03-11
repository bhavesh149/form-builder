from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.config import get_settings
from app.db.base import Base
from app.db.database import engine
from app.api import auth, metadata, forms, submissions, uploads

# Import all models so they're registered with Base
from app.models import User, Branch, Form, FormVersion, FormSubmission  # noqa: F401

settings = get_settings()


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="Humanity Forms API",
        description="Dynamic Safety Form Engine — API",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS
    origins = [
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
    ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(auth.router)
    app.include_router(metadata.router)
    app.include_router(forms.router)
    app.include_router(submissions.router)
    app.include_router(uploads.router)

    @app.on_event("startup")
    def on_startup():
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        
        # Seed default branches if none exist
        from app.db.database import SessionLocal
        db = SessionLocal()
        try:
            if db.query(Branch).count() == 0:
                logger.info("Seeding initial branches...")
                default_branches = [
                    Branch(name="Headquarters", location="New York, NY"),
                    Branch(name="Northside Site", location="Chicago, IL"),
                    Branch(name="West Coast Hub", location="San Francisco, CA"),
                    Branch(name="Factory A", location="Detroit, MI"),
                ]
                db.add_all(default_branches)
                db.commit()
                logger.info("Successfully seeded 4 branches.")
        finally:
            db.close()
            
        logger.info("Humanity Forms API started successfully")

    @app.get("/api/health")
    def health_check():
        return {"status": "healthy", "version": "1.0.0"}

    return app


app = create_app()
