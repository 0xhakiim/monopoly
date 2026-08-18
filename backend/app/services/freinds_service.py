from operator import or_

from app.db.init_db import SessionLocal as db

from sqlalchemy import or_,select
from app.models.models import friendships,status
def send_request(user_id,friends_id):
    pass

def accept_request(user_id,sender_id):
    pass
def get_friends(user_id):
    session =db()
    stmt = (
    select(friendships)
    .where(
        or_(
            friendships.sender_id == user_id,
            friendships.receiver_id == user_id,
        ),
        friendships.status == status.Accepted.value
        )
    )

    friendship = session.scalars(stmt).all()
    print(friendship)
    return friendship