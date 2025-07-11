import os

import modal

app = modal.App()


@app.function(secrets=[modal.Secret.from_name("hf-token")])
def f():
    print(os.environ["HF_TOKEN"])