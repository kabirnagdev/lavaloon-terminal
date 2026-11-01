import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Financial Intelligence & Due Diligence Terminal"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Host & Port
    HOST: str = os.getenv("BACKEND_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("BACKEND_PORT", "8000"))
    
    # CORS
    CORS_ORIGINS: List[str] = [
        origin.strip() for origin in os.getenv(
            "BACKEND_CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000"
        ).split(",") if origin.strip()
    ]
    
    # AI Engine Keys & Config
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    EMBED_MODEL: str = os.getenv("EMBED_MODEL", "all-MiniLM-L6-v2")
    DATA_CSV_PATH: str = os.getenv("DATA_CSV_PATH", "data/Finance_data.csv")
    
    # Graph Backend Selection: "NETWORKX" | "NEO4J"
    GRAPH_BACKEND: str = os.getenv("GRAPH_BACKEND", "NETWORKX")

    # Optional Enterprise Neo4j
    NEO4J_URI: str = os.getenv("NEO4J_URI", "")
    NEO4J_USER: str = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

