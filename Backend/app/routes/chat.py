"""POST /chat and GET /chat: auth + quota(chat), run agent, save messages, load history."""
from fastapi import APIRouter, Request, HTTPException
from app.middleware.auth import require_auth
from app.middleware.quota import require_quota
from app.services.chat_agent import run_agent
from app.services.chat_history import get_recent_chat_history, save_chat_message

router = APIRouter()


@router.get("")
@require_auth
@require_quota("chat")
async def get_chat_history(request: Request, limit: int = 50):
    org_id = request.state.org_id
    user_id = request.state.user_id
    history = get_recent_chat_history(org_id, user_id, limit=limit)
    return {"messages": history}


@router.post("")
@require_auth
@require_quota("chat")
async def chat(request: Request, body: dict):
    org_id = request.state.org_id
    user_id = request.state.user_id
    message = (body.get("message") or "").strip()
    if not message:
        raise HTTPException(400, detail="Message cannot be empty")
    if len(message) > 2000:
        raise HTTPException(400, detail="Message too long. Max 2000 characters.")
    history = get_recent_chat_history(org_id, user_id, limit=20)
    messages = history + [{"role": "user", "content": message}]
    response = await run_agent(org_id, messages)
    save_chat_message(org_id, user_id, "user", message)
    save_chat_message(org_id, user_id, "assistant", response)
    return {"response": response}
