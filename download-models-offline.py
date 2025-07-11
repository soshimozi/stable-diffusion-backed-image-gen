from huggingface_hub import snapshot_download

def downloadModelSnapshot(repo_root: str, model: str, dl_dir: str):
    repo = repo_root + model

    print(f"Starting download from {repo} to {dl_dir}")
    # snapshot_download(
    #     repo_id=repo,
    #     local_dir=dl_dir
    # )

    print(f"Downloaded model files for {repo}")


#if __name__ == "__main__":
repo_root = "stabilityai/"
model = "stable-diffusion-xl-base-1.0"
snapshot_download(repo_id="stabilityai/stable-diffusion-xl-base-1.0", local_dir="./.model-cache")

  #downloadModelSnapshot(repo_root=repo_root, model=model, dl_dir="./.models/" + model)
