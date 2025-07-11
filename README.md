# stable-diffusion-backed-image-gen

This project implements a real-time AI image generation pipeline using:

* **React frontend** (hosted on AWS)
* **FastAPI backend** hosted on Fly.io
* **Modal** as the GPU-backed image generation worker

---

---

## System Architecture

```
[ React UI ] → POST /enqueue → [ FastAPI ]
                     ↳ POST /status → [ FastAPI ] 
                                ↳ generates image
```

---

## Deployment

### 1. Deploy Modal Worker

**Steps:**

1. Sign up at [https://modal.com](https://modal.com)
2. Create a Hugging Face token:

   * [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
   * Make sure it has "read" access
3. Register your Hugging Face token with Modal:

```bash
modal secret create hf-token
# Paste in:
# HF_TOKEN=your_token_here
```

4. Deploy the worker:

```bash
modal deploy prompt_forge.py
```

---

## FastAPI Endpoints

* `POST /generate` → accepts prompt, returns job ID
* `POST /status` → accepts job\_id, returns status of job
* `GET /models` → returns list of available models

---

## Notes

* The image generation logic uses `FluxImageGenerator`

---

## Next Steps

* Add retry and error handling
