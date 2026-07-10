from langchain_chroma import Chroma
from app.core.ollama_client import get_embeddings
from app.core.config import settings


def get_vector_store(collection_name: str) -> Chroma:
    """
    Returns a Chroma vector store scoped to a specific collection.

    We namespace collections per school + course resource, e.g.
    "kisubi-high-school_biology_photosynthesis", so one school's
    curriculum embeddings are never mixed with another's.
    """
    return Chroma(
        collection_name=collection_name,
        embedding_function=get_embeddings(),
        persist_directory=settings.chroma_persist_dir,
    )