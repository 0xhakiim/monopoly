from fastapi import APIRouter, Depends, HTTPException
from app.api.security import get_current_user_http
from app.db.init_db import get_db  # Your MySQL session logic
from sqlalchemy import text

router = APIRouter(prefix="/friends")


@router.post("/request/{target_id}")
async def send_request(
    target_id: int, current_user=Depends(get_current_user_http), db=Depends(get_db)
):
    # 1. Logic Check
    if current_user == target_id:
        raise HTTPException(
            status_code=400, detail="Self-love is great, but you can't friend yourself."
        )

    # 2. Check if exists
    existing = db.execute(
        text(
            "SELECT * FROM friendships WHERE (user_id_1=:u1 AND user_id_2=:u2) OR (user_id_1=:u2 AND user_id_2=:u1)"
        ),
        {"u1": current_user, "u2": target_id},
    ).fetchone()

    if existing:
        return {
            "status": "exists",
            "detail": "Request already pending or you are friends.",
        }

    # 3. Save to MySQL
    db.execute(
        text(
            "INSERT INTO friendships (user_id_1, user_id_2, status) VALUES (:u1, :u2, 'pending')"
        ),
        {"u1": current_user, "u2": target_id},
    )
    db.commit()

    return {"message": "Request sent!"}


@router.post("/accept/{requester_id}")
async def accept_friend(
    requester_id: int, current_user=Depends(get_current_user_http), db=Depends(get_db)
):
    # Update status to accepted
    result = db.execute(
        text(
            "UPDATE friendships SET status='accepted' WHERE user_id_1=:u1 AND user_id_2=:u2"
        ),
        {"u1": requester_id, "u2": current_user},
    )
    db.commit()

    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Request not found.")

    return {"message": "You are now friends!"}


@router.post("/reject/{requester_id}")
async def reject_friend(
    requester_id: int, current_user=Depends(get_current_user_http), db=Depends(get_db)
):
    # Update status to rejected
    result = db.execute(
        text(
            "UPDATE friendships SET status='rejected' WHERE user_id_1=:u1 AND user_id_2=:u2"
        ),
        {"u1": requester_id, "u2": current_user},
    )
    db.commit()

    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Request not found.")

    return {"message": "Friend request rejected."}


@router.get("/list")
async def list_friends(current_user=Depends(get_current_user_http), db=Depends(get_db)):
    # Fetch accepted friends
    friends = db.execute(
        text(
            "SELECT user_id_1, user_id_2 FROM friendships WHERE (user_id_1=:u OR user_id_2=:u) AND status='accepted'"
        ),
        {"u": current_user},
    ).fetchall()

    friend_ids = []
    for f in friends:
        friend_ids.append(f.user_id_2 if f.user_id_1 == current_user else f.user_id_1)

    return {"friends": friend_ids}


@router.get("/requests")
async def list_requests(
    current_user=Depends(get_current_user_http), db=Depends(get_db)
):
    # Fetch pending requests where current_user is the target
    requests = db.execute(
        text(
            "SELECT * FROM friendships WHERE (user_id_2=:u OR user_id_1=:u) AND status='pending'"
        ),
        {"u": current_user},
    ).fetchall()

    requester_ids = [r.user_id_1 for r in requests]

    return {"requests": requester_ids}


@router.get("/search")
async def search_users(
    query: str, current_user=Depends(get_current_user_http), db=Depends(get_db)
):
    results = db.execute(
        text("SELECT id, username FROM users WHERE username LIKE :q AND id != :u"),
        {"q": f"%{query}%", "u": current_user},
    ).fetchall()

    return {"results": [{"id": r.id, "username": r.username} for r in results]}
