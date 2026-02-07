from app.db.init_db import SessionLocal as db
from app.models.User import User
import bcrypt
import jwt
import datetime
from app.config import SECRET_KEY

secret = SECRET_KEY


def register_user(username: str, password: str, email: str = ""):
    session = db()
    existing_user = session.query(User).filter_by(username=username).first()
    if existing_user:
        return 0
    hashed_password = hash_password(password)
    new_user = User(username=username, password=hashed_password, email=email)
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    token = create_token(new_user.id)  # or use username/email/etc.
    new_user.token = token  # assuming you have a `token` column
    session.commit()
    return {"access_token": new_user.token, "token_type": "bearer"}


def authenticate_user(username: str, password: str):
    session = db()
    user = session.query(User).filter_by(username=username).first()
    if not user:
        print("creds not correct")
        return False
    if check_password(password, user.password):
        print("logged in")
        return create_token(user.id)


def change_password(username: str, old_password: str, new_password: str) -> bool:
    session = db()
    user = session.query(User).filter_by(username=username).first()
    if not user:
        print("User not found")
        return False
    if not check_password(old_password, user.password):
        print("Old password is incorrect")
        return False
    user.password = hash_password(new_password)
    session.commit()
    print("Password changed successfully")
    return True


def create_token(user_id: int):
    payload = {
        "user_id": user_id,
        "exp": datetime.datetime.now() + datetime.timedelta(hours=1),
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


def get_all_users():
    session = db()
    return session.query(User).all()
