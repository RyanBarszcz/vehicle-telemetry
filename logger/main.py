# logger/main.py

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "logger_service:app",
        host="127.0.0.1",
        port=8765,
        reload=False,
    )