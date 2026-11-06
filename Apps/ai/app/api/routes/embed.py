from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.document_service import extract_text
from app.services.rag_service import embed_document
from app.models.document import EmbedDocumentResponse

router = APIRouter()


@router.post("/embed/document", response_model=EmbedDocumentResponse)
async def embed_document_route(
    school_code: str = Form(...),
    course_resource_id: str = Form(...),
    file: UploadFile = File(...),
):
    file_bytes = await file.read()

    try:
        text_content = extract_text(file.filename, file_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not text_content.strip():
        raise HTTPException(status_code=400, detail="No extractable text found in document")

    chunks_created = embed_document(school_code, course_resource_id, text_content)

    return EmbedDocumentResponse(
        course_resource_id=course_resource_id,
        chunks_created=chunks_created,
        status="embedded",
    )