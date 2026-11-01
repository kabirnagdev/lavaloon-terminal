import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.api.dependencies.database import get_graph_state
from backend.app.api.routes import (
    health,
    companies,
    graph,
    research,
    diligence,
    quant
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Financial Intelligence Engine & Knowledge Graph...")
    state = get_graph_state()
    logger.info(f"Loaded {len(state.df)} survey records, {state.G.number_of_nodes()} graph nodes, {state.A.number_of_edges()} association edges.")
    yield
    logger.info("Shutting down Financial Intelligence Terminal Backend.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Institutional-grade Financial Intelligence, Knowledge Graph, and Due Diligence Terminal API.",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
api_v1 = settings.API_V1_STR
app.include_router(health.router, prefix=api_v1)
app.include_router(companies.router, prefix=api_v1)
app.include_router(graph.router, prefix=api_v1)
app.include_router(research.router, prefix=api_v1)
app.include_router(diligence.router, prefix=api_v1)
app.include_router(quant.router, prefix=api_v1)

@app.get("/")
def root():
    return {
        "terminal": "Financial Intelligence & Due Diligence Terminal",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)

