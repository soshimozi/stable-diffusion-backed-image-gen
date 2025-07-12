import shutil
import modal
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel
import time;
import os
from fastapi import Depends, HTTPException
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, Integer, String, select
from typing import Optional    

# Use the new App-based API
app = modal.App("image-generator")

weightsVolume = modal.Volume.from_name("weights", create_if_missing=True)

MIN_GPU_CONTAINERS = 0

# Define the container image with required packages
gpu_image = (
    modal.Image.debian_slim()
    .pip_install(
        "accelerate==0.33.0",
        "diffusers==0.31.0",
        "fastapi[standard]==0.115.4",
        "huggingface-hub[hf_transfer]==0.25.2",
        "sentencepiece==0.2.0",
        "torch==2.5.1",
        "torchvision==0.20.1",
        "transformers~=4.44.0",
        "peft==0.11.1",
    )
    .env({"HF_HUB_ENABLE_HF_TRANSFER": "1"})  # turn on faster downloads from HF    
)

with gpu_image.imports():
    import torch
    from huggingface_hub import snapshot_download
    from io import BytesIO
    from diffusers.pipelines import DiffusionPipeline
    from diffusers import StableDiffusion3Pipeline
    from diffusers import FluxPipeline
    from diffusers import AutoPipelineForText2Image
    from fastapi import Response
    from typing import Optional
    
@app.cls(
    image=gpu_image, 
    gpu="A100",     
    min_containers=MIN_GPU_CONTAINERS,
    volumes={"/weights": weightsVolume},
    secrets=[modal.Secret.from_name("hf-token")],  # 👈 attaches HF_TOKEN env var
)
class SDXLTurboGenerator:
    @modal.enter()
    def enter(self):

        model = "sdxl-turbo"
        model_path = "/weights/model-cache/" + model
        self.pipe = AutoPipelineForText2Image.from_pretrained(model_path, torch_dtype=torch.float16, variant="fp16")
        self.pipe.to("cuda")
                
    @modal.method()
    def generate(
        self,
        request: dict,
    ) -> bytes:
        
        image = self.pipe(
            prompt=request["prompt"],
            width=request["width"],
            height=request["height"],
            num_inference_steps=1,
            guidance_scale=0.0,
        ).images[0]

        buf = BytesIO()
        image.save(buf, format="PNG")
        return buf.getvalue()
  

@app.cls(
    image=gpu_image, 
    gpu="A100",     
    min_containers=MIN_GPU_CONTAINERS,
    volumes={"/weights": weightsVolume},
    secrets=[modal.Secret.from_name("hf-token")],  # 👈 attaches HF_TOKEN env var
)
class FluxGhibliArtGenerator:
    @modal.enter()
    def enter(self):

        model = "FLUX.1-dev"

        model_path = "/weights/model-cache/" + model
        self.pipe = DiffusionPipeline.from_pretrained(model_path, torch_dtype=torch.bfloat16)

        lora_repo = "strangerzonehf/Flux-Ghibli-Art-LoRA"
        self.pipe.load_lora_weights(lora_repo)
        self.pipe.to("cuda")

    @modal.method()
    def generate(
        self,
        request: dict,
    ) -> bytes:
        
        image = self.pipe(
            prompt=request["prompt"],
            num_inference_steps=request["iterations"],
            guidance_scale=request["guidance"],
            width=request["width"],
            height=request["height"]        
        ).images[0]

        buf = BytesIO()
        image.save(buf, format="PNG")
        return buf.getvalue()


@app.cls(
    image=gpu_image, 
    gpu="A100",     
    min_containers=MIN_GPU_CONTAINERS,
    volumes={"/weights": weightsVolume},
    secrets=[modal.Secret.from_name("hf-token")],  # 👈 attaches HF_TOKEN env var
)
class Isometric3DGenerator:
    @modal.enter()
    def enter(self):

        model = "FLUX.1-dev"

        model_path = "/weights/model-cache/" + model
        self.pipe = DiffusionPipeline.from_pretrained(model_path, torch_dtype=torch.bfloat16)

        lora_repo = "strangerzonehf/Flux-Isometric-3D-LoRA"
        #trigger_word = "Isometric 3D"  
        self.pipe.load_lora_weights(lora_repo)
        self.pipe.to("cuda")

    @modal.method()
    def generate(
        self,
        request: dict,
    ) -> bytes:
        
        image = self.pipe(
            prompt=request["prompt"],
            num_inference_steps=request["iterations"],
            guidance_scale=request["guidance"],
            width=request["width"],
            height=request["height"]        
        ).images[0]

        buf = BytesIO()
        image.save(buf, format="PNG")
        return buf.getvalue()


@app.cls(
    image=gpu_image, 
    gpu="A100",     
    min_containers=MIN_GPU_CONTAINERS,
    volumes={"/weights": weightsVolume},
    secrets=[modal.Secret.from_name("hf-token")],  # 👈 attaches HF_TOKEN env var
)
class SuperRealismArtGenerator:
    @modal.enter()
    def enter(self):

        model = "FLUX.1-dev"
        model_path = "/weights/model-cache/" + model
        self.pipe = DiffusionPipeline.from_pretrained(model_path, torch_dtype=torch.bfloat16)

        lora_repo = "strangerzonehf/Flux-Super-Realism-LoRA"
        self.pipe.load_lora_weights(lora_repo)

        self.pipe.to("cuda")

    @modal.method()
    def generate(
        self,
        request: dict,
    ) -> bytes:
        
        image = self.pipe(
            prompt=request["prompt"],
            num_inference_steps=request["iterations"],
            guidance_scale=request["guidance"],
            width=request["width"],
            height=request["height"]        
        ).images[0]

        buf = BytesIO()
        image.save(buf, format="PNG")
        return buf.getvalue()
      

@app.cls(
    image=gpu_image, 
    gpu="A100",     
    min_containers=MIN_GPU_CONTAINERS,
    volumes={"/weights": weightsVolume},
    secrets=[modal.Secret.from_name("hf-token")],  # 👈 attaches HF_TOKEN env var
)
class AnimeArtGenerator:
    @modal.enter()
    def enter(self):

        model = "FLUX.1-dev"
        model_path = "/weights/model-cache/" + model
        self.pipe = AutoPipelineForText2Image.from_pretrained(
            model_path, 
            torch_dtype=torch.float16
        )

        lora_repo = "dataautogpt3/FLUX-AestheticAnime"
        self.pipe.load_lora_weights(lora_repo, weight_name="Flux_1_Dev_LoRA_AestheticAnime.safetensors")

        self.pipe.to("cuda")
    @modal.method()
    def generate(
        self,
        request: dict,
    ) -> bytes:
        
        image = self.pipe(
            prompt=request["prompt"],
            num_inference_steps=request["iterations"],
            guidance_scale=request["guidance"],
            width=request["width"],
            height=request["height"]        
        ).images[0]

        buf = BytesIO()
        image.save(buf, format="PNG")
        return buf.getvalue()
     

@app.cls(
    image=gpu_image, 
    gpu="A100",     
    min_containers=MIN_GPU_CONTAINERS,
    volumes={"/weights": weightsVolume},
    secrets=[modal.Secret.from_name("hf-token")],  # 👈 attaches HF_TOKEN env var
)
class OpenDalleV1Generator:
    @modal.enter()
    def enter(self):

        model = "OpenDalleV1.1"
        model_path = "/weights/model-cache/" + model
        self.pipe = AutoPipelineForText2Image.from_pretrained(model_path, torch_dtype=torch.float16)
        self.pipe = self.pipe.to("cuda")
                
    @modal.method()
    def generate(
        self,
        request: dict,
    ) -> bytes:
        
        image = self.pipe(
            prompt=request["prompt"],
            num_inference_steps=request["iterations"],
            guidance_scale=request["guidance"],
            width=request["width"],
            height=request["height"]
        ).images[0]

        buf = BytesIO()
        image.save(buf, format="PNG")
        return buf.getvalue()
    

@app.cls(
    image=gpu_image, 
    gpu="A100",     
    min_containers=MIN_GPU_CONTAINERS,
    volumes={"/weights": weightsVolume},
    secrets=[modal.Secret.from_name("hf-token")],  # 👈 attaches HF_TOKEN env var
)
class StableDiffusionGenerator:
    @modal.enter()
    def enter(self):

        model = "stable-diffusion-3.5-large"
        model_path = "/weights/model-cache/" + model
        self.pipe = StableDiffusion3Pipeline.from_pretrained(model_path, torch_dtype=torch.bfloat16)
        self.pipe = self.pipe.to("cuda")
                
    @modal.method()
    def generate(
        self,
        request: dict,
    ) -> bytes:
        
        image = self.pipe(
            prompt=request["prompt"],
            num_inference_steps=request["iterations"],
            guidance_scale=request["guidance"],
            width=request["width"],
            height=request["height"]
        ).images[0]

        buf = BytesIO()
        image.save(buf, format="PNG")
        return buf.getvalue()

    
@app.cls(
    image=gpu_image, 
    gpu="A100",     
    min_containers=MIN_GPU_CONTAINERS,
    volumes={"/weights": weightsVolume},
    secrets=[modal.Secret.from_name("hf-token")],  # 👈 attaches HF_TOKEN env var
)
class FluxGenerator:
    @modal.enter()
    def enter(self):

        model = "FLUX.1-dev"
        model_path = "/weights/model-cache/" + model
        self.pipe = FluxPipeline.from_pretrained(model_path, torch_dtype=torch.bfloat16)
        self.pipe = self.pipe.to("cuda")

    @modal.method()
    def generate(
        self,
        request: dict,
    ) -> bytes:
        
        image = self.pipe(
            prompt=request["prompt"],
            num_inference_steps=request["iterations"],
            guidance_scale=request["guidance"],
            width=request["width"],
            height=request["height"]
        ).images[0]

        buf = BytesIO()
        image.save(buf, format="PNG")
        return buf.getvalue()

frontend_path = Path(__file__).parent / "images"

web_image = (
    modal.Image.debian_slim(python_version="3.12")
    .pip_install(
        "fastapi[all]",
        "python-jose[cryptography]",
        "httpx",
        "requests"
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
    

DATABASE_URL = os.environ["DATABASE_URL"]  # e.g., postgresql+asyncpg://user:pass@host/db

engine = create_async_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

async def get_db():
    async with SessionLocal() as session:
        yield session


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

class UserProfile(Base):
    __tablename__ = "user_profile"

    id = Column(Integer, primary_key=True)
    email = Column(String)
    selected_model = Column(String)  # Adjust columns as needed

class UserProfileResponse(BaseModel):
    selected_model: str


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

MODEL_LIST =   [
            {
                "id": "flux",
                "name": "FLUX Transformer",
                "description": "A 12B rectified flow transformer model for high-fidelity image generation.",
                "icon_url": "flux.png",
                "available": True,
                "trigger_word": None,
                "tags": ["high-quality", "experimental"],
                "image_data": None,
            },
            {
                "id": "sd3.5",
                "name": "Stable Diffusion 3.5",
                "description": "A cutting-edge text-to-image model from Stability AI. Delivers improved coherence, detail, and image fidelity over previous SD versions. Great for both photorealistic and artistic generations.",
                "icon_url": "stable-diffusion.png",
                "available": True,
                "trigger_word": None,
                "tags": ["stable", "photorealistic", "balanced", "v3"],
                "image_data": None,
            },
            {
                "id": "opendalle",
                "name": "Open Dalle v1.1",
                "description": "A cutting-edge text-to-image model from that competes with DALLE-3.",
                "icon_url": "open-dalle.png",
                "available": True,
                "trigger_word": None,
                "tags": ["stable", "photorealistic", "balanced", "v3"],
                "image_data": None,
            },
            {
                "id": "sdxl-turbo",
                "name": "SDXL-Turbo",
                "description": "SDXL-Turbo is a fast generative text-to-image model that can synthesize photorealistic images from a text prompt in a single network evaluation.",
                "icon_url": "sdxl-turbo.png",
                "available": True,
                "trigger_word": None,
                "tags": ["turbo", "photorealistic", "balanced"],
                "image_data": None,
            },
            {
                "id": "ghibli",
                "name": "Flux Anime Ghibli Art LoRA",
                "description": "A Flux LoRa in the style of Anime Ghibli Art.",
                "icon_url": "ghibli.png",
                "trigger_word": "Ghibli Art",
                "available": True,
                "tags": ["LoRA", "artistic", "ghibli-style"],
                "image_data": None,
            },
            {
                "id": "flux-aestehticanime",
                "name": "Flux Aesthetic Anime LoRA",
                "description": "A Flux LoRa in the style and aesthetic of ghibli retro anime.",
                "icon_url": "flux-aesthetic-anime.png",
                "trigger_word": None,
                "available": True,
                "tags": ["LoRA", "artistic", "ghibli-style"],
                "image_data": None,
            },
            {
                "id": "iso",
                "name": "Flux Isometric 3D LoRA",
                "description": "A Flux LoRA in the style of isometric 3D.",
                "icon_url": "iso.png",
                "trigger_word": "Isometric 3D",
                "available": True,
                "tags": ["LoRA", "artistic", "iso-style"],
                "image_data": None,
            },
            {
                "id": "super-realism",
                "name": "Flux Super Realism LoRA",
                "description": "A Flux LoRA for super realism.",
                "icon_url": "super-realisim.png",
                "trigger_word": "Super Realism",
                "available": True,
                "tags": ["LoRA", "super-realism", "artistic"],
                "image_data": None,
            },
            {
                "id": "sdxl-base",
                "name": "SD-XL 1.0 Base ",
                "description": "generative text-to-image model that can synthesize photorealistic images from a text prompt",
                "icon_url": "flux.png",
                "trigger_word": None,
                "available": False,
                "tags": ["SD-XL", "high-quality", "balanced"],
                "image_data": None,
            }                                                         


            # Add more as needed...
        ]  


@app.function(
    image=web_image, 
    min_containers=1, 
    secrets=[modal.Secret.from_name("environment")]
)
@modal.concurrent(max_inputs=1000)
@modal.asgi_app()
def ui():
    import fastapi.staticfiles
    from fastapi import FastAPI
    from fastapi.responses import FileResponse
    from fastapi.responses import JSONResponse
    from fastapi.middleware.cors import CORSMiddleware
    import os
    import base64
    from fastapi import Depends, HTTPException
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
    from sqlalchemy.orm import sessionmaker, declarative_base
    from sqlalchemy import Column, String, select
    from typing import Optional    

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

    @web_app.get("/models", response_model=List[ModelInfo], dependencies=[Depends(JWTBearer())])
    def list_models():
        for model in MODEL_LIST:
            if not model.get("image_data"):
                image_path = os.path.join(STATIC_DIR, model["icon_url"].lstrip("/"))
                try:
                    with open(image_path, "rb") as f:
                        encoded = base64.b64encode(f.read()).decode("utf-8")
                        model["image_data"] = f"data:image/png;base64,{encoded}"
                except FileNotFoundError:
                    model["image_data"] = None  # fallback or leave empty
        return MODEL_LIST
    
    @web_app.post("/start-job", dependencies=[Depends(JWTBearer)])
    async def start_image_job(request: ImageRequest):
        
        model_id = request.model_id
        prompt = request.prompt

        if request.model_id not in MODEL_REGISTRY:
            raise ValueError(f"Unknown model: {model_id}")
        
        job_id = None

        Model = modal.Cls.from_name("image-generator", MODEL_REGISTRY[model_id])
        job_id = Model().generate.spawn(request.model_dump()).object_id


        # match model_id:
        #     case "sdxl-turbo":
        #         Model = modal.Cls.from_name("image-generator", MODEL_REGISTRY[model_id])
        #         job_id = SDXLTurboGenerator().generate.spawn(prompt).object_id                
        #     case "opendalle":
        #         job_id = OpenDalleV1Generator().generate.spawn(prompt).object_id
        #     case "iso":
        #         job_id = Isometric3DGenerator().generate.spawn(prompt).object_id
        #     case "super-realism":
        #         job_id = SuperRealismArtGenerator().generate.spawn(prompt).object_id
        #     case "flux-aestehticanime":
        #         Model = modal.Cls.from_name("image-generator", "AnimeArtGenerator")
        #         job_id = Model().generate.spawn(prompt).object_id
        #     case "ghibli":
        #         Model = modal.Cls.from_name("image-generator", "FluxGhibliArtGenerator")
        #         job_id = Model().generate.spawn(prompt).object_id
        #     case "sd3.5":
        #         job_id = StableDiffusionGenerator().generate.spawn(prompt).object_id
        #     case "flux":
        #         Model = modal.Cls.from_name("image-generator", "FluxGenerator")
        #         job_id = Model().generate.spawn(prompt).object_id

        return JSONResponse(content={"job_id": job_id})


    @web_app.get("/generate", dependencies=[Depends(JWTBearer())])
    async def proxy_generate(prompt: str, model_id: str):
        
        if model_id not in MODEL_REGISTRY:
            raise ValueError(f"Unknown model: {model_id}")        
        
        image_data = None

        match model_id:
            case "sdxl-turbo":
                image_data = SDXLTurboGenerator().generate.remote(prompt)  # or .remote() for async
            case "opendalle":
                image_data = OpenDalleV1Generator().generate.remote(prompt)
            case "iso":
                image_data = Isometric3DGenerator().generate.remote(prompt)
            case "super-realism":
                image_data = SuperRealismArtGenerator().generate.remote(prompt)
            case "flux-aestehticanime":
                image_data = AnimeArtGenerator().generate.remote(prompt)
            case "ghibli":
                image_data = FluxGhibliArtGenerator().generate.remote(prompt)
            case "sd3.5":
                image_data = StableDiffusionGenerator().generate.remote(prompt)
            case "flux":
                image_data = FluxGenerator().generate.remote(prompt)


        return Response(content=image_data, media_type="image/png")
    
    @web_app.get("/generate-async", dependencies=[Depends(JWTBearer())])
    async def proxy_generate_job(prompt: str, model_id: str):

        if model_id not in MODEL_REGISTRY:
            raise ValueError(f"Unknown model: {model_id}")        
        
        job_id = None

        match model_id:
            case "sdxl-turbo":
                job_id = SDXLTurboGenerator().generate.spawn(prompt).object_id                
            case "opendalle":
                job_id = OpenDalleV1Generator().generate.spawn(prompt).object_id
            case "iso":
                job_id = Isometric3DGenerator().generate.spawn(prompt).object_id
            case "super-realism":
                job_id = SuperRealismArtGenerator().generate.spawn(prompt).object_id
            case "flux-aestehticanime":
                Model = modal.Cls.from_name("image-generator", "AnimeArtGenerator")
                job_id = Model().generate.spawn(prompt).object_id
            case "ghibli":
                Model = modal.Cls.from_name("image-generator", "FluxGhibliArtGenerator")
                job_id = Model().generate.spawn(prompt).object_id
            case "sd3.5":
                job_id = StableDiffusionGenerator().generate.spawn(prompt).object_id
            case "flux":
                Model = modal.Cls.from_name("image-generator", "FluxGenerator")
                job_id = Model().generate.spawn(prompt).object_id

        return JSONResponse(content={"job_id": job_id})
    
    @web_app.get("/result/{job_id}", dependencies=[Depends(JWTBearer())])
    async def poll_results(job_id: str):
        image_job = modal.FunctionCall.from_id(job_id)

        try:
            result = image_job.get(timeout=0)
        except TimeoutError:
            return JSONResponse(content="", status_code=202)

        return Response(content=result, media_type="image/png")
    
    return web_app

def slugify(s: str) -> str:
    return "".join(c if c.isalnum() else "-" for c in s).strip("-")


@app.local_entrypoint()
def main_turbo():
    prompt = "A cute racoon in a priest robe."
    image_data = StableDiffusionGenerator().generate.remote(prompt)  # or .remote() for async

    with open("output2.png", "wb") as f:
        f.write(image_data)
    print("Image saved to output2.png")