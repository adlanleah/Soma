from app.core.chroma_client import get_vector_store
from app.utils.text_splitter import split_text
from app.core.config import settings


def collection_name_for(school_code: str, course_resource_id: str) -> str:
    """
    Namespaces every Chroma collection by school code, so one school's
    curriculum embeddings can never be retrieved by another school.
    """
    safe_school = school_code.lower().replace(" ", "-")
    return f"{safe_school}_{course_resource_id}"


def embed_document(school_code: str, course_resource_id: str, text_content: str) -> int:
    """
    Chunks the given document text and stores embeddings in Chroma,
    scoped to this school + course resource.
    Returns the number of chunks created.
    """
    chunks = split_text(text_content)
    if not chunks:
        return 0

    collection = collection_name_for(school_code, course_resource_id)
    store = get_vector_store(collection)
    store.add_texts(chunks)

    return len(chunks)


def retrieve_context(school_code: str, course_resource_ids: list[str], query: str) -> str:
    """
    Searches across one or more course resources for the chunks most
    relevant to the given query, and returns them joined as a single
    context block for the LLM prompt.
    """
    all_results: list[str] = []

    for resource_id in course_resource_ids:
        collection = collection_name_for(school_code, resource_id)
        store = get_vector_store(collection)
        try:
            results = store.similarity_search(query, k=settings.retrieval_top_k)
            all_results.extend([doc.page_content for doc in results])
        except Exception:
            # Collection may not exist yet if this resource was never embedded
            continue

    if not all_results:
        return ""

    return "\n\n---\n\n".join(all_results)