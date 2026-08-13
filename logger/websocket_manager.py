import asyncio
from typing import Any

from fastapi import WebSocket


class WebSocketManager:
    def __init__(self) -> None:
        self.active_connections: set[WebSocket] = set()
        self.event_loop: asyncio.AbstractEventLoop | None = None

    def set_event_loop(
        self,
        event_loop: asyncio.AbstractEventLoop,
    ) -> None:
        self.event_loop = event_loop

    async def connect(
        self,
        websocket: WebSocket,
    ) -> None:
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(
        self,
        websocket: WebSocket,
    ) -> None:
        self.active_connections.discard(websocket)

    async def broadcast(
        self,
        data: dict[str, Any],
    ) -> None:
        disconnected: list[WebSocket] = []

        for websocket in self.active_connections.copy():
            try:
                await websocket.send_json(data)
            except Exception:
                disconnected.append(websocket)

        for websocket in disconnected:
            self.disconnect(websocket)

    def broadcast_from_thread(
        self,
        data: dict[str, Any],
    ) -> None:
        if self.event_loop is None:
            return

        asyncio.run_coroutine_threadsafe(
            self.broadcast(data),
            self.event_loop,
        )


websocket_manager = WebSocketManager()