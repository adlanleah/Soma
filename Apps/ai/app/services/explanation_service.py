from app.core.ollama_client import get_llm
from app.services.rag_service import retrieve_context
from app.prompts.explanation_prompts import build_explanation_prompt
from app.models.quiz import GenerateExplanationRequest, GenerateExplanationResponse


def generate_explanation(req: GenerateExplanationRequest) -> GenerateExplanationResponse:
    context = retrieve_context(req.school_code, req.course_resource_ids, req.topic)

    if not context:
        return GenerateExplanationResponse(
            topic=req.topic,
            explanation="No curriculum content has been uploaded for this topic yet.",
            key_points=[],
        )

    prompt_template = build_explanation_prompt(req.age_group, req.topic)
    prompt = prompt_template.format(context=context)

    llm = get_llm(temperature=0.4)
    response = llm.invoke(prompt)
    content = response.content if hasattr(response, "content") else str(response)

    # Simple key-point extraction: lines starting with a bullet marker
    key_points = [
        line.strip("-• ").strip()
        for line in content.split("\n")
        if line.strip().startswith(("-", "•"))
    ]

    return GenerateExplanationResponse(
        topic=req.topic,
        explanation=content,
        key_points=key_points,
    )