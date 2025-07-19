from typing_extensions import Annotated
import modal
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, Mapped, mapped_column, Session
from sqlalchemy import Column, ForeignKey, Integer, String, Boolean, create_engine, select
from typing import Optional    
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel
from fastapi import Depends, HTTPException
from modal import Dict

app = modal.App("image-generator-api")

class ModelInfo(BaseModel):
    id: str
    name: str
    description: str
    available: bool
    tags: List[str]
    trigger_word: str | None
    image_data: str
    negative_available: bool
    model_url: str | None
    resize_available: bool
    steps_available: bool
    guidance_available: bool
    
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
    selected_model: str | None
    token_count: int


Base = declarative_base()

int_pk = Annotated[int, mapped_column(Integer, primary_key=True)]
str_250 = Annotated[str, mapped_column(String(length=250))]
#int = Annotated[int, mapped_column(Integer)]

class ModelData(Base):
    __tablename__ = "model"
    
    id = Column(String, primary_key=True)
    name = Column(String)
    description = Column(String)
    icon_url = Column(String)
    available = Column(Boolean)
    trigger_word = Column(String)
    tags = Column(String)
    negative_available = Column(Boolean)
    model_url = Column(String)
    resize_available = Column(Boolean)
    steps_available = Column(Boolean)
    guidance_available = Column(Boolean)


class UserProfile(Base):
    __tablename__ = "user_profile"

    id: Mapped[int_pk] #Column(Integer, primary_key=True)
    user_name: Mapped[str_250]
    token_count: Mapped[int]
    preferences: Mapped["UserPreferences"] = relationship(
        back_populates="user"
    )

class UserPreferences(Base):
    __tablename__ = "user_prefs"

    id: Mapped[int_pk]
    selected_model_id: Mapped[str_250]
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("user_profile.id"),
    )
    user: Mapped["UserProfile"] = relationship(
        back_populates="preferences"
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

    #STATIC_DIR = "/webAssets"
    STATIC_DIR = "/assets"

    @web_app.get("/me", response_model=UserProfileResponse)
    async def get_profile(payload=Depends(JWTBearer())):
        subject = payload.get("sub")
        if not subject:
            raise HTTPException(status_code=400, detail="Subject not found in token")
        
        with engine.begin() as conn:
            row = conn.execute(
                select(UserProfile.user_name, UserProfile.token_count, UserPreferences.selected_model_id).join(UserPreferences)
            ).first()

            if row:
                # row = (user_name, token_count, selected_model)
                return UserProfileResponse(token_count=row[1], selected_model=row[2])


        # no existing profile → INSERT
        with Session(bind=engine) as session:
            profile = UserProfile(user_name=subject, token_count=100)
            preferences = UserPreferences(selected_model_id=None, user=profile)

            session.add(profile)
            session.add(preferences)

            session.commit()
        # conn.execute(
        #     insert(UserProfile).values(
        #         user_name=subject,
        #         token_count=100
        #     )
        # )

        # engine.begin() auto-commits here
        return UserProfileResponse(token_count=100, selected_model=None)      


    @web_app.get("/model", response_model=List[ModelInfo], dependencies=[Depends(JWTBearer())])
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

            image_path = os.path.join(STATIC_DIR, db_model.icon_url.lstrip("/"))
            try:
                with open(image_path, "rb") as f:
                    encoded = base64.b64encode(f.read()).decode("utf-8")
                    model["image_data"] = f"data:image/png;base64,{encoded}"
            except FileNotFoundError:
                model["image_data"] = ""  # fallback or leave empty


            model_list.append(model)

        return model_list
    
    
    @web_app.post("/job", dependencies=[Depends(JWTBearer)])
    async def start_image_job(request: ImageRequest):
        
        model_id = request.model_id
        if request.model_id not in MODEL_REGISTRY:
            raise ValueError(f"Unknown model: {model_id}")
        
        job_id = None

        Model = modal.Cls.from_name("image-generator", MODEL_REGISTRY[model_id])

        data = request.model_dump()
        job_id = Model().generate.spawn(data).object_id
        await job_dictionary.put.aio(job_id, data)

        return JSONResponse(content={"job_id": job_id})


    @web_app.get("/job/{job_id}", dependencies=[Depends(JWTBearer())])
    async def poll_results(job_id: str):
        image_job = modal.FunctionCall.from_id(job_id)

        try:
            b64_list  = image_job.get(timeout=0)
        except TimeoutError:
            return JSONResponse(content="", status_code=202)

        job_entry = await job_dictionary.pop.aio(job_id)
        if job_entry == None:
            return JSONResponse(content={"message": "Job entry not found."}, status_code=404)
        

        #await job_dictionary.delete.aio(job_id)

        # Convert each bytes object to list of ints so it’s JSON‐serializable
        #images_as_int_lists = [list(img_bytes) for img_bytes in result]
        #return JSONResponse(content={"images": images_as_int_lists})
        return JSONResponse({"images": b64_list, "request": job_entry})
    
    return web_app



#print(select(user_table.c.name, address_table.c.email_address).join(address_table))

@app.function(
    timeout=2700,  # timeout in seconds (e.g., 900s = 15 minutes)
    cpu=4,
    image=web_image,
    secrets=[modal.Secret.from_dotenv()],  # 👈 attaches HF_TOKEN env var
    )
async def test():
    from typing_extensions import Annotated
    import modal
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
    from sqlalchemy.orm import sessionmaker, declarative_base, relationship, Mapped, mapped_column, Session
    from sqlalchemy import Column, ForeignKey, Integer, String, Boolean, create_engine, select
    from typing import Optional    
    from pathlib import Path
    from typing import List, Optional
    from pydantic import BaseModel
    from fastapi import Depends, HTTPException
    from modal import Dict

    print(select(UserProfile.user_name, UserPreferences.selected_model).join(UserPreferences))