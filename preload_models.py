import modal

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
    
# Use the new App-based API
app = modal.App("preload")

webAssetsVolume = modal.Volume.from_name("web-assets", create_if_missing=True)

weightsVolume = modal.Volume.from_name("weights", create_if_missing=True)

def downloadModelSnapshot(repo_root: str, model: str, dl_dir: str):
    repo = repo_root + model

    print(f"Starting download from {repo} to {dl_dir}")
    snapshot_download(
        repo_id=repo,
        local_dir=dl_dir
    )

    print(f"Downloaded model files for {repo}")

@app.function(
    volumes={"/weights": weightsVolume}, 
    timeout=900,  # timeout in seconds (e.g., 900s = 15 minutes)
    image=image,     
    secrets=[modal.Secret.from_name("hf-token")],  # 👈 attaches HF_TOKEN env var
    )
def preload_openDalle():
    repo_root = "dataautogpt3/"
    model = "OpenDalleV1.1"
    downloadModelSnapshot(repo_root=repo_root, model=model, dl_dir="/weights/model-cache/" + model)


@app.function(
    volumes={"/weights": weightsVolume}, 
    timeout=900,  # timeout in seconds (e.g., 900s = 15 minutes)
    image=image,     
    secrets=[modal.Secret.from_name("hf-token")],  # 👈 attaches HF_TOKEN env var
    )
def preload_flux():
    model = "FLUX.1-dev"
    repo = "black-forest-labs/" + model
    dl_dir = "/weights/model-cache/" + model

    print(f"Starting download from {repo} to {dl_dir}")

    snapshot_download(
        repo_id=repo,
        local_dir=dl_dir,   # makes it usable as a direct `from_pretrained` path
    )    

    print("Flux model preloaded to volume.")   



@app.function(
    volumes={"/weights": weightsVolume}, 
    timeout=900,  # timeout in seconds (e.g., 900s = 15 minutes)
    image=image,     
    secrets=[modal.Secret.from_name("hf-token")],  # 👈 attaches HF_TOKEN env var
    )
def preload_sd():
    model = "stable-diffusion-3.5-large"
    dl_dir = "/weights/model-cache/" + model
    downloadModelSnapshot(repo_root="stabilityai/", model=model, dl_dir=dl_dir)


@app.function(
    volumes={"/weights": weightsVolume}, 
    timeout=900,  # timeout in seconds (e.g., 900s = 15 minutes)
    image=image,     
    secrets=[modal.Secret.from_name("hf-token")],  # 👈 attaches HF_TOKEN env var
    )
def preload_sdxl_turbo():
    repo_root = "stabilityai/"
    model = "sdxl-turbo"

    downloadModelSnapshot(repo_root=repo_root, model=model, dl_dir="/weights/model-cache/" + model)



@app.function(
    volumes={"/weights": weightsVolume}, 
    timeout=900,  # timeout in seconds (e.g., 900s = 15 minutes)
    image=image,     
    secrets=[modal.Secret.from_name("hf-token")],  # 👈 attaches HF_TOKEN env var
    )
def preload_sdxl_base():
    repo_root = "stabilityai/"
    model = "stable-diffusion-xl-base-1.0"

    downloadModelSnapshot(repo_root=repo_root, model=model, dl_dir="/weights/model-cache/" + model)



