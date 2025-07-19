import os

import modal

app = modal.App()


@app.function(secrets=[modal.Secret.from_name("db-secrets"), modal.Secret.from_name("hf-token"), modal.Secret.from_name("environment")])
def f():
    print(os.environ["DATABASE_URL"])
    print(os.environ["HF_TOKEN"])
    print(os.environ["API_AUDIENCE"])
    print(os.environ["AUTH0_DOMAIN"])
    print(os.environ["ORIGINS"])