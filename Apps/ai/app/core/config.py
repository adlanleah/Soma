from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.1:8b"
    ollama_embed_model: str = "nomic-embed-text"

    chroma_persist_dir: str = "./chroma_data"

    max_upload_size_mb: int = 10
    chunk_size: int = 500
    chunk_overlap: int = 50

    retrieval_top_k: int = 5

    port: int = 8000

    class Config:
        env_file = ".env"


settings = Settings()