import json
from app.core.ollama_client import get_llm
from app.prompts.safety_prompts import SAFETY_CHECK_PROMPT
from app.models.safety import SafetyCheckResult


def check_safety(question: str, answer: str) -> SafetyCheckResult:
    llm = get_llm(temperature=0.0)
    prompt = SAFETY_CHECK_PROMPT.format(question=question, answer=answer)

    try:
        response = llm.invoke(prompt)
        content = response.content if hasattr(response, "content") else str(response)

        # Strip markdown code fences if the model wraps its JSON output
        cleaned = content.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]

        data = json.loads(cleaned)
        return SafetyCheckResult(
            flagged=data.get("flagged", False),
            severity=data.get("severity", "low"),
            reason=data.get("reason"),
        )
    except Exception:
        # If the safety checker itself fails, fail safe — don't block
        # the response, but don't crash the request either.
        return SafetyCheckResult(flagged=False, severity="low", reason=None)