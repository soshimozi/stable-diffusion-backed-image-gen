# stable-diffusion-backed-image-gen

This project implements a real-time AI image generation pipeline using:

* **React frontend** (hosted on AWS)
* **FastAPI backend** hosted on Fly.io
* **Modal** as the GPU-backed image generation worker
* **AWS SQS** as the message queue
* **No storage** — image is streamed back to the client over WebSockets

---

## Project Structure

```
├── websocket_server.py      # FastAPI server for enqueue, push, and WebSocket
├── modal_worker.py          # Modal worker that polls SQS and triggers image gen
├── fly.toml                 # Fly.io config file for deploying FastAPI
├── Dockerfile               # Dockerfile for FastAPI app
```

---

## System Architecture

```
[ React UI ] → POST /enqueue → [ FastAPI (Fly.io) ]
                     ↳ WebSocket /ws <─────┐
                                          │
           [ Modal Worker ] ← polls SQS ←─┘
                                ↳ generates image and POSTs /push
```

---

## Deployment

### 1. Deploy FastAPI WebSocket Server to Fly.io

**Prerequisites:**

* Install Fly CLI: [https://fly.io/docs/hands-on/install-flyctl/](https://fly.io/docs/hands-on/install-flyctl/)
* Run `fly auth login`
* Create the app: `fly launch`
* Ensure `fly.toml` and `Dockerfile` are present

**Deploy:**

```bash
fly deploy
```

**Example fly.toml:**

```toml
app = "image-ws-backend"

[env]
PORT = "8000"

[[services]]
  internal_port = 8000
  protocol = "tcp"

  [[services.ports]]
    port = 443
    handlers = ["http", "tls"]

  [[services.ports]]
    port = 80
    handlers = ["http"]
```

---

### 2. Deploy Modal Worker

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
modal deploy modal_worker.py
```

The `poll_sqs()` function runs every minute:

```python
@app.function(schedule=modal.Periodic("*/1 * * * *"))
```

---

## FastAPI Endpoints

* `POST /enqueue` → accepts prompt, returns job ID
* `POST /push` → accepts job\_id + base64 image, sends to open WebSocket
* `WebSocket /ws?jobId=...` → client connects and waits for image

---

## Security Suggestions

* Use UUIDs or signed job IDs
* Protect `/push` with HMAC or secret token
* Restrict CORS to your frontend domain
* Consider timeout or idle limits on WebSockets

---

## Testing Locally

```bash
uvicorn websocket_server:app --host 0.0.0.0 --port 8000
```

Then connect via:

```
ws://localhost:8000/ws?jobId=test-123
```

And send a POST to `/enqueue` with JSON `{ "prompt": "A fox in space" }`

---

## Notes

* This repo assumes you have SQS configured and accessible from Modal
* The image generation logic uses `FluxImageGenerator`
* No image is saved or stored permanently — all is in-memory

---

## Next Steps

* Add retry and error handling
* Add job expiration / timeout
* Add support for client polling fallback if WebSocket fails
