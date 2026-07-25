from datetime import datetime

from pydantic import BaseModel, ConfigDict


class HealthResponse(BaseModel):
    status: str
    database: str
    version: str
    environment: str


class SystemInfoResponse(BaseModel):
    id: int
    name: str
    value: str
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
