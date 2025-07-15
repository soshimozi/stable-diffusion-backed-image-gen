import modal

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
    import base64
    from diffusers import (
        StableDiffusionXLPipeline, 
        KDPM2AncestralDiscreteScheduler,
        AutoencoderKL
    )    
    
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
    gpu="A100-80GB",     
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
    ) -> list[bytes]:
        
        num_images = request.get("num_images", 1)

        seed = request.get("seed", None)
        if seed is not None:
            # one Generator seeded => deterministic batch
            gen = torch.Generator(device="cuda").manual_seed(int(seed))
            generator_arg = {"generator": gen}
        else:
            # no generator => fresh random for each image
            generator_arg = {}

        outputs = self.pipe(
            prompt=request["prompt"],
            num_inference_steps=request.get("iterations", 75),
            guidance_scale=request.get("guidance", 3.5),
            num_images_per_prompt=num_images
        )

        data_urls = []
        for img in outputs.images:
            buf = BytesIO()
            img.save(buf, format="PNG")
            b64 = base64.b64encode(buf.getvalue()).decode("ascii")
            data_urls.append(b64)
        return data_urls
    
        #buf = BytesIO()
        #image.save(buf, format="PNG")
        #return buf.getvalue()

######################################################
     
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
    
@app.cls(
    image=gpu_image, 
    gpu="A100",     
    min_containers=MIN_GPU_CONTAINERS,
    volumes={"/weights": weightsVolume},
    secrets=[modal.Secret.from_name("hf-token")],  # 👈 attaches HF_TOKEN env var
)
class ProteusGenerator:
    @modal.enter()
    def enter(self):

        model = "ProteusV0.4"
        model_path = "/weights/model-cache/" + model
        
        # Load VAE component
        vae = AutoencoderKL.from_pretrained(
            "madebyollin/sdxl-vae-fp16-fix", 
            torch_dtype=torch.float16
        )

        self.pipe = StableDiffusionXLPipeline.from_pretrained(
            "dataautogpt3/ProteusV0.4", 
            vae=vae,
            torch_dtype=torch.float16,
            cache_dir=model_path
        )        

        self.pipe.scheduler = KDPM2AncestralDiscreteScheduler.from_config(self.pipe.scheduler.config)
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
            height=request["height"],
            negative_prompt=["negative_prompt"]
        ).images[0]

        buf = BytesIO()
        image.save(buf, format="PNG")
        return buf.getvalue()    


def slugify(s: str) -> str:
    return "".join(c if c.isalnum() else "-" for c in s).strip("-")


@app.local_entrypoint()
def main_turbo():
    prompt = "A cute racoon in a priest robe."
    image_data = StableDiffusionGenerator().generate.remote(prompt)  # or .remote() for async

    with open("output2.png", "wb") as f:
        f.write(image_data)
    print("Image saved to output2.png")