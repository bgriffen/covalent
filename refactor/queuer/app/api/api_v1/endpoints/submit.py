from typing import Any, Optional

from fastapi import APIRouter, File

from app.schemas.workflow import DispatchResponse

router = APIRouter()


@router.post("/dispatch", status_code=200, response_model=DispatchResponse)
def submit_workflow(
    *,
    data: bytes
) -> Any:
    """
    Submit a workflow
    """
    return {
        "dispatch_id": "48f1d3b7-27bb-4c5d-97fe-c0c61c197fd5"
    }