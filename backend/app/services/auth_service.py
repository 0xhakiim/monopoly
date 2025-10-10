from app.db.init_db import SessionLocal as db
from app.models.User import User
import bcrypt
import jwt
import datetime
secret = "my_secret"
def register_user(username: str, password: str, email: str = None):
    session = db()
    existing_user = session.query(User).filter_by(username=username).first()
    if existing_user:
        return {"error": "Username already exists"}
    hashed_password = hash_password(password)
    new_user = User(username=username, password=hashed_password, email=email)
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    token = create_token(new_user.id)  # or use username/email/etc.
    new_user.token = token             # assuming you have a `token` column
    session.commit()
    return {"access_token": f"token_for_{new_user.username}", "token_type": "bearer"}

def authenticate_user( username: str, password: str):
    session = db()
    user = session.query(User).filter_by(username=username).first()
    if not user:
        return False
    return check_password(password, user.hashed_password)

def create_token(user_id: int):
    payload = {
        "user_id": user_id,
        "exp": datetime.datetime.now() + datetime.timedelta(hours=1)
    }
    token = jwt.encode(payload, secret, algorithm="HS256")
    return token
def verify_token(token: str):
    try:
        data = jwt.decode(token, secret, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        print("Token expired")
        return None
    except jwt.InvalidTokenError:
        print("Invalid token")
        return None
    return data
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def check_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())