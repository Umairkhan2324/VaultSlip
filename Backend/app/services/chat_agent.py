"""Chat agent: tools over Supabase receipts; Groq chat.completions."""
import json
from typing import Dict, List

from app.services.groq_client import chat_completion
from app.services.receipt_tools import run_tool

TOOLS: List[Dict] = [
    {
        "type": "function",
        "function": {
            "name": "search_receipts",
            "description": "Search receipts by vendor, date range, category, or amount.",
            "parameters": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_spending_summary",
            "description": "Get summary: total spend, by category, by vendor.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_flagged_receipts",
            "description": "Get receipts flagged for review or low confidence.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "audit_high_spend",
            "description": "Find high-value receipts above a minimum total, optionally filtered by category.",
            "parameters": {
                "type": "object",
                "properties": {
                    "min_total": {"type": "number"},
                    "category": {"type": "string"},
                },
                "required": ["min_total"],
            },
        },
    },
]


async def run_agent(org_id: str, messages: list[dict], max_turns: int = 5) -> str:
    system = (
        "You are a receipt assistant. Help the user query and understand their receipt data. "
        "Use the tools to search, summarize, or list flagged receipts. Be concise."
    )
    history: List[Dict] = [{"role": "system", "content": system}] + messages
    for _ in range(max_turns):
        resp = chat_completion("llama-3.3-70b-versatile", history, tools=TOOLS)
        choice = resp["choices"][0]
        msg = choice["message"]
        if choice.get("finish_reason") == "stop":
            return (msg.get("content") or "").strip()
        tool_calls = msg.get("tool_calls") or []
        if not tool_calls:
            return (msg.get("content") or "").strip()
        history.append(msg)
        for tc in tool_calls:
            name = tc["function"]["name"]
            args = json.loads(tc["function"].get("arguments") or "{}")
            result = run_tool(org_id, name, args)
            history.append(
                {
                    "role": "tool",
                    "tool_call_id": tc.get("id"),
                    "content": result,
                }
            )
    return "I reached the turn limit. Please try a shorter question."
