import json
from typing import Any

import requests


OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3.2:latest"


CONTRACT_SCHEMA = {
    "type": "object",
    "properties": {
        "summary": {
            "type": "string"
        },
        "risk_score": {
            "type": "integer"
        },
        "missing_clauses": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        "compliance_issues": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        "clauses": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "clause_type": {
                        "type": "string"
                    },
                    "text": {
                        "type": "string"
                    },
                    "risk_level": {
                        "type": "string",
                        "enum": ["low", "medium", "high"]
                    },
                    "explanation": {
                        "type": "string"
                    },
                    "recommendation": {
                        "type": "string"
                    }
                },
                "required": [
                    "clause_type",
                    "text",
                    "risk_level",
                    "explanation",
                    "recommendation"
                ]
            }
        }
    },
    "required": [
        "summary",
        "risk_score",
        "missing_clauses",
        "compliance_issues",
        "clauses"
    ]
}


def analyze_contract(contract_text: str) -> dict[str, Any]:
    if not contract_text or not contract_text.strip():
        raise ValueError("Contract content cannot be empty.")

    prompt = f"""
Analyze the following procurement contract.

Identify:
1. A concise contract summary.
2. Overall contract risk score from 0 to 100.
3. Important standard clauses that appear to be missing.
4. Compliance issues or concerning contractual terms.
5. Important clauses found in the contract.
6. Risk level for each important clause.
7. A short explanation of each clause risk.
8. A practical recommendation for each risky clause.

Contract:

{contract_text}
"""

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "format": CONTRACT_SCHEMA,
        "stream": False,
        "options": {
            "temperature": 0
        }
    }

    try:
        response = requests.post(
            OLLAMA_URL,
            json=payload,
            timeout=180,
        )
    except requests.RequestException as exc:
        raise RuntimeError(
            f"Could not connect to Ollama at {OLLAMA_URL}: {exc}"
        ) from exc

    if response.status_code != 200:
        raise RuntimeError(
            f"Ollama returned HTTP {response.status_code}: "
            f"{response.text}"
        )

    try:
        response_data = response.json()
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            "Ollama returned an invalid HTTP response."
        ) from exc

    raw_response = response_data.get("response")

    if not raw_response:
        raise RuntimeError(
            "Ollama returned an empty model response."
        )

    try:
        analysis = json.loads(raw_response)
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"Ollama returned invalid structured JSON: {exc}"
        ) from exc

    if not isinstance(analysis, dict):
        raise ValueError(
            "Ollama response was not a JSON object."
        )

    analysis.setdefault("summary", "")
    analysis.setdefault("risk_score", 0)
    analysis.setdefault("missing_clauses", [])
    analysis.setdefault("compliance_issues", [])
    analysis.setdefault("clauses", [])

    try:
        risk_score = int(float(analysis["risk_score"]))
    except (TypeError, ValueError):
        risk_score = 0

    analysis["risk_score"] = max(
        0,
        min(100, risk_score)
    )

    if not isinstance(
        analysis["missing_clauses"],
        list
    ):
        analysis["missing_clauses"] = []

    if not isinstance(
        analysis["compliance_issues"],
        list
    ):
        analysis["compliance_issues"] = []

    if not isinstance(
        analysis["clauses"],
        list
    ):
        analysis["clauses"] = []

    cleaned_clauses = []

    for clause in analysis["clauses"]:
        if not isinstance(clause, dict):
            continue

        risk_level = str(
            clause.get("risk_level", "low")
        ).lower()

        if risk_level not in {
            "low",
            "medium",
            "high"
        }:
            risk_level = "low"

        cleaned_clauses.append(
            {
                "clause_type": str(
                    clause.get(
                        "clause_type",
                        "Unclassified Clause"
                    )
                ),
                "text": str(
                    clause.get("text", "")
                ),
                "risk_level": risk_level,
                "explanation": str(
                    clause.get("explanation", "")
                ),
                "recommendation": str(
                    clause.get("recommendation", "")
                ),
            }
        )

    analysis["clauses"] = cleaned_clauses

    return analysis