from datetime import datetime
from typing_extensions import Annotated
import modal
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, Mapped, mapped_column, Session
from sqlalchemy import Column, ForeignKey, Integer, String, Boolean, Text, create_engine, select, DateTime, TIMESTAMP
from typing import Optional    
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel
from fastapi import Depends, HTTPException
from modal import Dict

app = modal.App("image-generator-api")

TOKENS_PER_IMAGE = 5

class ModelInfo(BaseModel):
    id: int
    model_id: str
    name: str
    description: str
    available: bool
    tags: List[str]
    trigger_word: str | None
    image_url: str
    negative_available: bool
    model_url: str | None
    resize_available: bool
    steps_available: bool
    guidance_available: bool
    
class UserProfilePutRequest(BaseModel):
    selected_model_id: int

class ImageRequest(BaseModel):
    prompt: str
    model_id: str
    height: int
    width: int
    iterations: int
    guidance: float
    seed: int | None = None
    num_images: int
    negative_prompt: str | None = None

class UserProfileResponse(BaseModel):
    selected_model_id: int | None
    token_count: int
    user_name: str


Base = declarative_base()

int_pk = Annotated[int, mapped_column(Integer, primary_key=True)]
str_256 = Annotated[str, mapped_column(String(length=256))]
str_250 = Annotated[str, mapped_column(String(length=250))]
str_150 = Annotated[str, mapped_column(String(length=150))]
dt = Annotated[datetime, mapped_column(TIMESTAMP)]
tz = Annotated[datetime, mapped_column(TIMESTAMP)]
txt = Annotated[str, mapped_column(Text)]
#int = Annotated[int, mapped_column(Integer)]

class ModelData(Base):
    __tablename__ = "model"
    id: Mapped[int_pk]    
    model_id: Mapped[Annotated[str, mapped_column(String(length=100))]] # Column(String, primary_key=True)
    name: Mapped[Annotated[str, mapped_column(String(length=200))]] # Column(String)
    description: Mapped[Annotated[str, mapped_column(Text)]] #Column(String)
    icon_url: Mapped[Annotated[str, mapped_column(String(length=50))]] #
    available: Mapped[Annotated[bool, mapped_column(Boolean)]] #Column(Boolean)
    trigger_word: Mapped[Annotated[str, mapped_column(String(length=50))]] # Column(String)
    tags: Mapped[Annotated[str, mapped_column(String(length=1024))]] # Column(String)
    negative_available: Mapped[Annotated[bool, mapped_column(Boolean)]] # = Column(Boolean)
    model_url: Mapped[Annotated[str, mapped_column(String(length=256))]] # = Column(String)
    resize_available: Mapped[Annotated[bool, mapped_column(Boolean)]] # Column(Boolean)
    steps_available: Mapped[Annotated[bool, mapped_column(Boolean)]] # Column(Boolean)
    guidance_available: Mapped[Annotated[bool, mapped_column(Boolean)]] # Column(Boolean)
    users: Mapped[list["UserProfile"]] = relationship(
        "UserProfile",
        back_populates="model",
        cascade="all, delete",
    )    
    jobs: Mapped[list["Job"]] = relationship(
        "Job",
        back_populates="model",
        cascade="all, delete",
    )    


class UserProfile(Base):
    __tablename__ = "user_profile"

    id: Mapped[int_pk] #Column(Integer, primary_key=True)
    user_name: Mapped[str_250]
    token_count: Mapped[int]
    preferences: Mapped["UserPreferences"] = relationship(
        "UserPreferences",
        back_populates="user",
        cascade="all, delete",
    )
    images: Mapped[list["UserImage"]] = relationship(
        "UserImage",
        back_populates="user",
        cascade="all, delete",
    )
    selected_model_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("model.id"),
    )
    model: Mapped["ModelData"] = relationship(
        "ModelData",
        back_populates="users"
    )

class UserPreferences(Base):
    __tablename__ = "user_prefs"

    id: Mapped[int_pk]
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("user_profile.id"),
    )
    user: Mapped["UserProfile"] = relationship(
        back_populates="preferences"
    )

class Job(Base):
    __tablename__ = "job"
    id: Mapped[int_pk]
    job_reference_id: Mapped[str_150]
    start_time: Mapped[tz]
    end_time: Mapped[tz]
    image_width: Mapped[int]
    image_height: Mapped[int]
    prompt: Mapped[str_256]
    seed: Mapped[int]
    cfg: Mapped[int]
    steps: Mapped[int]
    images: Mapped[list["UserImage"]] = relationship(
        "UserImage",
        back_populates="job",
        cascade="all, delete",
    )
    model_id: Mapped[int] =  mapped_column(
        Integer,
        ForeignKey("model.id")
    )
    model: Mapped["ModelData"] = relationship(
        "ModelData",
        back_populates="jobs"
    )    

class UserImage(Base):
    __tablename__ = "user_image"
    id: Mapped[int_pk]
    job_id: Mapped[int] =  mapped_column(
        Integer,
        ForeignKey("job.id")
    )
    job: Mapped["Job"] = relationship(
        "Job",
        back_populates="images"
    )
    index: Mapped[int]
    image_data: Mapped[txt]
    user_id: Mapped[int] =  mapped_column(
        Integer,
        ForeignKey("user_profile.id")
    )
    user: Mapped["UserProfile"] = relationship(
        "UserProfile",
        back_populates="images"
    )



frontend_path = Path(__file__).parent / "images"

job_dictionary = modal.Dict.from_name("job-dict", create_if_missing=True)

web_image = (
    modal.Image.debian_slim(python_version="3.12")
    .pip_install(
        "fastapi[all]",
        "python-jose[cryptography]",
        "httpx",
        "requests",
        "sqlalchemy",
        "psycopg2-binary",
    )
    .add_local_dir(frontend_path, remote_path="/assets")
)

with web_image.imports():
    from fastapi import Request, Depends, HTTPException
    from fastapi.responses import Response
    from fastapi.staticfiles import StaticFiles
    from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
    from typing import List
    from jose import jwt, JWTError
    import requests
    import base64
    from fastapi import Depends, HTTPException
    from sqlalchemy.orm import declarative_base
    from sqlalchemy import Column, String



MODEL_REGISTRY = {
    "flux": "FluxGenerator",
    "sd3.5": "StableDiffusionGenerator",
    "opendalle": "OpenDalleV1Generator",
    "sdxl-turbo": "SDXLTurboGenerator",
    "ghibli": "FluxGhibliArtGenerator",
    "flux-aestehticanime": "AnimeArtGenerator",
    "super-realism": "SuperRealismArtGenerator",
    "iso": "Isometric3DGenerator",
    "sdxl-base": "SDXLBaseGenerator",
    "proteusv0.2": "ProteusGenerator"
}


@app.function(
    image=web_image, 
    min_containers=1, 
    secrets=[modal.Secret.from_dotenv()]
)
@modal.concurrent(max_inputs=1000)
@modal.asgi_app()
def ui():
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    from fastapi.middleware.cors import CORSMiddleware
    from sqlalchemy.engine import URL
    import os
    from sqlalchemy import insert, select


    # === JWT AUTH CONFIG ===
    AUTH0_DOMAIN = os.environ["AUTH0_DOMAIN"]
    API_AUDIENCE = os.environ["API_AUDIENCE"]
    ALGORITHMS = ["RS256"]
    JWKS_URL = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
    ORIGINS = os.environ["ORIGINS"]


    engine = create_engine(os.getenv('DATABASE_URL'), echo=True)

    web_app = FastAPI()

    web_app.mount(
        "/assets",
        StaticFiles(directory="/assets", html=False),
        name="assets",
    )

    web_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"], #ORIGINS.split(",") if ORIGINS else [],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )    

    # --- AUTH DEPENDENCY ---
    class JWTBearer(HTTPBearer):
        def __init__(self, auto_error: bool = True):
            super(JWTBearer, self).__init__(auto_error=auto_error)

        async def __call__(self, request: Request):
            credentials: HTTPAuthorizationCredentials = await super().__call__(request)
            if credentials:
                try:
                    payload = verify_jwt(credentials.credentials)
                    return payload  # optionally pass user info
                except JWTError as e:
                    raise HTTPException(status_code=403, detail=str(e))
            raise HTTPException(status_code=403, detail="Invalid authorization code.")
        
    # --- JWT Verification ---
    def verify_jwt(token: str):
        jwks = requests.get(JWKS_URL).json()
        unverified_header = jwt.get_unverified_header(token)

        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"],
                }
        if rsa_key:
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=ALGORITHMS,
                audience=API_AUDIENCE,
                issuer=f"https://{AUTH0_DOMAIN}/",
            )
            return payload
        raise JWTError("Invalid JWT")

    STATIC_DIR = "/assets"

    @web_app.put("/me")
    async def put_profile(request: UserProfilePutRequest, payload=Depends(JWTBearer())):
        subject = payload.get("sub")

        with Session(bind=engine) as session:
            record = session.query(UserProfile).filter(UserProfile.user_name == subject).first()

            if not record:
                raise HTTPException(status_code=404, detail="Item not found")
            
            record.selected_model_id = request.selected_model_id
            session.commit()


    @web_app.get("/me", response_model=UserProfileResponse)
    async def get_profile(payload=Depends(JWTBearer())):
        subject = payload.get("sub")
        if not subject:
            raise HTTPException(status_code=400, detail="Subject not found in token")
        
        with Session(bind=engine) as session:
            record = session.query(UserProfile).filter(UserProfile.user_name == subject).first()

            selected_model = None
            if record.model is not None:
                selected_model = record.model.id

            if record:
                print("found record")
                return UserProfileResponse(user_name=subject, selected_model_id=selected_model, token_count=record.token_count)

            profile = UserProfile(user_name=subject, token_count=100, selected_model_id=None)
            session.add(profile)

            session.commit()
            return UserProfileResponse(token_count=100, user_name=subject, selected_model_id=None)      


    @web_app.get("/model", response_model=List[ModelInfo])
    async def list_models():
        engine = create_engine(os.getenv('DATABASE_URL'), echo=True)

        database_models = []

        with engine.connect() as conn:
            result = conn.execute(select(ModelData))
            database_models = result.fetchall()


        model_list = []

        for db_model in database_models:

            model = {
                "id": db_model.id,
                "model_id": db_model.model_id,
                "name": db_model.name,
                "description": db_model.description,
                "available": db_model.available,
                "tags": db_model.tags.split(','),
                "trigger_word": db_model.trigger_word,
                "image_data": "",
                "negative_available": db_model.negative_available,
                "model_url": db_model.model_url,
                "resize_available": db_model.resize_available,
                "steps_available": db_model.steps_available,
                "guidance_available": db_model.guidance_available
            }

            print("loading image data")
            image_path = os.path.join(STATIC_DIR, db_model.icon_url.lstrip("/"))
            model["image_url"] = image_path
            # try:
            #     with open(image_path, "rb") as f:
            #         encoded = base64.b64encode(f.read()).decode("utf-8")
            #         #model["image_data"] = f"data:image/png;base64,{encoded}"
            # except FileNotFoundError:
            #     model["image_data"] = ""  # fallback or leave empty


            model_list.append(model)

        #print(model_list)

        print(f"Return {len(model_list)} models")
        return model_list
    
    
    @web_app.post("/job")
    async def start_image_job(request: ImageRequest, payload=Depends(JWTBearer())):
        subject = payload.get("sub")

        model_id = request.model_id
        if request.model_id not in MODEL_REGISTRY:
            raise ValueError(f"Unknown model: {model_id}")
        
        with Session(bind=engine) as session:
            record = session.query(UserProfile).filter(UserProfile.user_name == subject).first()

            if record is None:
                raise PermissionError(f"User not registered.")
            
        job_id = None

        Model = modal.Cls.from_name("image-generator", MODEL_REGISTRY[model_id])

        data = request.model_dump()
        job_id = Model().generate.spawn(data).object_id
        await job_dictionary.put.aio(job_id, data)
    
        with Session(bind=engine) as session:
            model = session.query(ModelData).filter(ModelData.model_id == request.model_id).first()

            if model is None:
                raise ValueError(f"Invalid model id: {request.model_id}")
            
            model_id = model.id

            print("model_id: ", model_id)
            print("job_id: ", job_id)

            job_id_str = job_id

            new_job = Job(job_reference_id = job_id_str, 
                          start_time = datetime.now(), 
                          image_width = request.width,
                          image_height = request.height,
                          prompt = request.prompt,
                          seed = request.seed,
                          cfg = request.guidance,
                          steps = request.iterations,
                          model_id = model_id
                          ) 
            
            session.add(new_job)

            #save the job   
            session.commit()


        return JSONResponse(content={"job_id": job_id})


    @web_app.get("/job/{job_id}")
    async def poll_results(job_id: str, payload=Depends(JWTBearer())):
        subject = payload.get("sub")

        image_job = modal.FunctionCall.from_id(job_id)

        try:
            b64_list  = image_job.get(timeout=0)
        except TimeoutError:
            return JSONResponse(content="", status_code=202)

        has_entry = job_dictionary.contains(job_id)

        if has_entry:
            job_entry = await job_dictionary.pop.aio(job_id)
            if job_entry == None:
                return JSONResponse(content={"message": "Job entry not found."}, status_code=404)
        else:
            return JSONResponse(content={"message": "Job entry not found."}, status_code=404)

        with Session(bind=engine) as session:
            job = session.query(Job).filter(Job.job_reference_id == job_id).first()
            user = session.query(UserProfile).filter(UserProfile.user_name == subject).first()

            if job is None:
                raise ValueError("Invalid job id: " + job_id)
            
            if user is None:
                raise PermissionError(f"Incorrect user.")

            tokens = 0
            job.end_time = datetime.now()

            for index in range(0, len(b64_list)):
                tokens = tokens + 1

                image = UserImage(job = job, index = index, image_data = b64_list[index], user_id=user.id)
                session.add(image)

            user.token_count = user.token_count - tokens
            session.commit()

        return JSONResponse({"images": b64_list, "request": job_entry})
    
    return web_app
