from app.utils.age_tier import get_age_tier_instruction


def build_explanation_prompt(age_group: str, topic: str) -> str:
    age_instruction = get_age_tier_instruction(age_group)

    return f"""{age_instruction}

Using ONLY the curriculum context provided below, write a clear visual
explanation of the topic: "{topic}"

CURRICULUM CONTEXT:
{{context}}

Structure your response as:
1. A simple opening explanation (2-3 sentences)
2. 3-5 key points as a bulleted breakdown
3. One relatable real-world example

Do not include any information not found in the context above."""