import json
import os
import threading
import time
import webbrowser
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

FILE_NAME = "contacts.json"

def load_contacts():

    if not os.path.exists(FILE_NAME):
        return {}
    try:
        with open(FILE_NAME, "r") as file:
            return json.load(file)
    except json.JSONDecodeError:
        return {}

def save_contacts(contacts):

    with open(FILE_NAME, "w") as file:
        json.dump(contacts, file, indent=4)

class ContactPayload(BaseModel):
    name: str
    phone: Optional[str] = ""
    email: Optional[str] = ""
    original_name: Optional[str] = None

app = FastAPI(title="NexContact API", version="1.0.0")

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_index():

    index_path = os.path.join("static", "index.html")
    if not os.path.exists(index_path):
        raise HTTPException(status_code=404, detail="index.html not found")
    with open(index_path, "r", encoding="utf-8") as file:
        return HTMLResponse(content=file.read(), status_code=200)

@app.get("/api/contacts")
async def get_contacts():

    return load_contacts()

@app.post("/api/contacts")
async def create_or_update_contact(payload: ContactPayload):

    contacts = load_contacts()
    name = payload.name.strip()
    phone = payload.phone.strip() if payload.phone else ""
    email = payload.email.strip() if payload.email else ""

    if not name:
        raise HTTPException(status_code=400, detail="Name cannot be empty")

    if payload.original_name:
        orig = payload.original_name.strip()
        if orig in contacts:
            if orig != name and name in contacts:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Cannot rename to '{name}' because a contact with that name already exists."
                )

            if orig != name:
                del contacts[orig]
    else:

        if name in contacts:
            raise HTTPException(
                status_code=400, 
                detail=f"Contact '{name}' already exists."
            )

    contacts[name] = {"phone": phone, "email": email}
    save_contacts(contacts)
    return {"message": "Success", "contact": contacts[name]}

@app.delete("/api/contacts/{name}")
async def delete_contact(name: str):

    contacts = load_contacts()
    name = name.strip()

    if name in contacts:
        del contacts[name]
        save_contacts(contacts)
        return {"message": f"Deleted '{name}' successfully."}
    else:
        raise HTTPException(status_code=404, detail=f"Contact '{name}' not found.")

def open_browser():

    time.sleep(1.5)
    webbrowser.open("http://127.0.0.1:8000")

if __name__ == "__main__":
    import uvicorn

    threading.Thread(target=open_browser, daemon=True).start()

    print("🚀 Starting NexContact local server on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)