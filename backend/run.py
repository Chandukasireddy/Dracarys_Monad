import uvicorn

if __name__ == "__main__":
    print("🐉 Launching Dracarys Verification Engine on Monad...")
    print("🔥 API Docs available at: http://127.0.0.1:8000/docs")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
