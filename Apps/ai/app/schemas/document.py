from pydantic import BaseModel


class EmbedDocumentRequest(BaseModel):
    school_code: str
    course_resource_id: str
    text_content: str  # raw extracted text, sent from NestJS after upload


class EmbedDocumentResponse(BaseModel):
    course_resource_id: str
    chunks_created: int
    status: str