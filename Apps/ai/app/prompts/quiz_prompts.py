from app.utils.age_tier import get_age_tier_instruction


def build_quiz_prompt(age_group: str, topic: str, question_count: int) -> str:
    age_instruction = get_age_tier_instruction(age_group)

    return f"""{age_instruction}

Using ONLY the curriculum context provided below, generate exactly
{question_count} multiple choice questions about the topic: "{topic}"

CURRICULUM CONTEXT:
{{context}}

Return ONLY valid JSON in this exact format, with no other text:
{{{{
  "questions": [
    {{{{
      "question": "...",
      "option_a": "...",
      "option_b": "...",
      "option_c": "...",
      "option_d": "...",
      "correct_option": "A",
      "explanation": "..."
    }}}}
  ]
}}}}

Every question must be answerable strictly from the context above.
Do not invent facts not present in the context."""