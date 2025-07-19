import os
from dotenv import load_dotenv
import modal
    
# Use the new App-based API
app = modal.App("preload")

webAssetsVolume = modal.Volume.from_name("web-assets", create_if_missing=True)

weightsVolume = modal.Volume.from_name("weights", create_if_missing=True)


load_dotenv()


database_url = os.getenv('DATABASE_URL')
api_audience = os.getenv('API_AUDIENCE')
hf_token = os.getenv('HF_TOKEN')
auth0_domain = os.getenv('AUTH0_DOMAIN')
origins = os.getenv('ORIGINS')


import time

image = (
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

with image.imports():
    from huggingface_hub import snapshot_download

async def downloadModelSnapshot(repo_root: str, model: str, dl_dir: str):
    repo = repo_root + model

    # Record the start time
    start_time = time.time()

    local_time = time.localtime(start_time)
    local_time_str = time.strftime('%H:%M:%S', local_time)


    print(f"Starting download from {repo} to {dl_dir} at {local_time_str}")
    snapshot_download(
        repo_id=repo,
        local_dir=dl_dir
    )

    end_time = time.time()
    elapsed_time = end_time - start_time

    minutes = int(elapsed_time // 60)
    seconds = int(elapsed_time % 60)

    print(f"Downloaded model files for {repo} in {minutes:02d}:{seconds:02d}")



models = [
    
    {
      "repo_root": "dataautogpt3/",
      "model": "OpenDalleV1.1"
    },
    {
      "model": "FLUX.1-dev",
      "repo_root": "black-forest-labs/"
    },
    {
      "repo_root": "stabilityai/",
      "model": "stable-diffusion-3.5-large"
    },
    {
      "repo_root": "stabilityai/",
      "model": "sdxl-turbo"
    },
    {
      "repo_root": "stabilityai/",
      "model": "stable-diffusion-xl-base-1.0"
    },

]


@app.function(
    volumes={"/weights": weightsVolume}, 
    timeout=2700,  # timeout in seconds (e.g., 900s = 15 minutes)
    image=image,     
    cpu=4,
    secrets=[modal.Secret.from_dotenv()],  # 👈 attaches HF_TOKEN env var
    )
async def preload_files():
    
    for m in models:
      await downloadModelSnapshot(repo_root=m['repo_root'], model=m['model'], dl_dir="/weights/model-cache/" + m['model'])


    print("Completed download")
    return