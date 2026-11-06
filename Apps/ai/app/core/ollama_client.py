from langchain_ollama import ChatOllama, OllamaEmbeddings
from app.core.config import settings


def get_llm(temperature: float = 0.3) -> ChatOllama:
    """
    Returns the local Ollama chat model used for generation
    (tutor responses, quiz questions, visual explanations).
    """
    return ChatOllama(
        base_url=settings.ollama_base_url,
        model=settings.ollama_model,
        temperature=temperature,
    )


def get_embeddings() -> OllamaEmbeddings:
    """
    Returns the local Ollama embedding model used to convert
    text chunks into vectors for storage/retrieval in Chroma.
    """
    return OllamaEmbeddings(
        base_url=settings.ollama_base_url,
        model=settings.ollama_embed_model,
    )