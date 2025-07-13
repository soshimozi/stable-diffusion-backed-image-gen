import modal
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, Integer, String, Boolean, create_engine, select
from typing import Optional    
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel
from fastapi import Depends, HTTPException

app = modal.App("image-generator-api")

Base = declarative_base()

class ModelInfo(BaseModel):
    id: str
    name: str
    description: str
    available: bool
    tags: List[str]
    trigger_word: str | None
    image_data: str
    
class ImageRequest(BaseModel):
    prompt: str
    model_id: str
    height: int | None = 1024
    width: int | None = 1024
    iterations: int | None = 50
    guidance: float | None = 3.5
    seed: float | None = None
    numberImages: int | None = 1


class ModelData(Base):
    __tablename__ = "model"
    
    id = Column(String, primary_key=True)
    name = Column(String)
    description = Column(String)
    icon_url = Column(String)
    available = Column(Boolean)
    trigger_word = Column(String)
    tags = Column(String)


class UserProfile(Base):
    __tablename__ = "user_profile"

    id = Column(Integer, primary_key=True)
    user_name = Column(String)
    selected_model = Column(String)  # Adjust columns as needed

class UserProfileResponse(BaseModel):
    selected_model: str


frontend_path = Path(__file__).parent / "images"

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
    from typing import Optional
    from fastapi import FastAPI, Request, Depends, HTTPException
    from fastapi.responses import FileResponse, Response
    from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
    from typing import List
    from jose import jwt, JWTError
    import requests
    import base64
    from fastapi import Depends, HTTPException
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
    from sqlalchemy.orm import sessionmaker, declarative_base
    from sqlalchemy import Column, String, select
    from typing import Optional    



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
}


@app.function(
    image=web_image, 
    min_containers=1, 
    secrets=[modal.Secret.from_name("environment"), modal.Secret.from_name("db-secrets")]
)
@modal.concurrent(max_inputs=1000)
@modal.asgi_app()
def ui():
    import fastapi.staticfiles
    from fastapi import FastAPI
    from fastapi.responses import FileResponse
    from fastapi.responses import JSONResponse
    from fastapi.middleware.cors import CORSMiddleware
    from sqlalchemy.engine import URL
    import os
    import re
    from sqlalchemy import text
    from sqlalchemy.ext.asyncio import create_async_engine


    # === JWT AUTH CONFIG ===
    AUTH0_DOMAIN = os.environ["AUTH0_DOMAIN"]
    API_AUDIENCE = os.environ["API_AUDIENCE"]
    ALGORITHMS = ["RS256"]
    JWKS_URL = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
    ORIGINS = os.environ["ORIGINS"]

    web_app = FastAPI()

    web_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"], #ORIGINS.split(",") if ORIGINS else [],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )    
    
    url = URL.create(
        drivername="postgresql",
        username="neondb_owner",
        password="npg_gsZd2Jezp0LT",
        host="localhost",
        database="mydb",
        port=5432
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
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=400, detail="Email not found in token")
        
        engine = create_engine(os.getenv('DATABASE_URL'), echo=True)

        #engine = create_async_engine(re.sub(r'^postgresql:', 'postgresql+asyncpg:', os.getenv('DATABASE_URL')), echo=True)
        with engine.connect() as conn:
            result = conn.execute(select(UserProfile).where(UserProfile.user_name == email))
            print(result.scalar_one_or_none())
        engine.dispose()        

        return UserProfileResponse(selected_model="it works!")
        # email = payload.get("email")
        # if not email:
        #     raise HTTPException(status_code=400, detail="Email not found in token")

        # result = await db.execute(select(UserProfile).where(UserProfile.email == email))
        # record = result.scalar_one_or_none()

        # if not record:
        #     raise HTTPException(status_code=404, detail="No data found for this user")

        # return UserProfileResponse(selected_model=record.selected_model)

    @web_app.get("/model", response_model=List[ModelInfo], dependencies=[Depends(JWTBearer())])
    async def list_models():
        engine = create_engine(os.getenv('DATABASE_URL'), echo=True)

        #engine = create_async_engine(re.sub(r'^postgresql:', 'postgresql+asyncpg:', os.getenv('DATABASE_URL')), echo=True)
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
                "image_data": ""
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
        prompt = request.prompt

        if request.model_id not in MODEL_REGISTRY:
            raise ValueError(f"Unknown model: {model_id}")
        
        job_id = None

        Model = modal.Cls.from_name("image-generator", MODEL_REGISTRY[model_id])
        job_id = Model().generate.spawn(request.model_dump()).object_id

        return JSONResponse(content={"job_id": job_id})


    @web_app.get("/job/{job_id}", dependencies=[Depends(JWTBearer())])
    async def poll_results(job_id: str):
        image_job = modal.FunctionCall.from_id(job_id)

        try:
            result = image_job.get(timeout=0)
        except TimeoutError:
            return JSONResponse(content="", status_code=202)

        return Response(content=result, media_type="image/png")
    
    return web_app
