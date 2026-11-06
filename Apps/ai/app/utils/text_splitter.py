from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.core.config import settings


def split_text(text: str) -> list[str]:
    """
    Splits raw document text into overlapping semantic chunks
    suitable for embedding and retrieval.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    return splitter.split_text(text)