# Copyright 2021 Agnostiq Inc.
#
# This file is part of Covalent.
#
# Licensed under the GNU Affero General Public License 3.0 (the "License").
# A copy of the License may be obtained with this software package or at
#
#      https://www.gnu.org/licenses/agpl-3.0.en.html
#
# Use of this file is prohibited except in compliance with the License. Any
# modifications or derivative works of this file must retain this copyright
# notice, and modified files must contain a notice indicating that they have
# been altered from the originals.
#
# Covalent is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
# FITNESS FOR A PARTICULAR PURPOSE. See the License for more details.
#
# Relief from the License may be granted by purchasing a commercial license.

import io
from typing import Any, Union

from app.schemas.common import HTTPExceptionSchema
from app.schemas.workflow import (
    InsertResultResponse,
    Node,
    Result,
    ResultPickle,
    UpdateResultResponse,
)
from fastapi import APIRouter, UploadFile, HTTPException
from fastapi.responses import FileResponse, StreamingResponse

router = APIRouter()


@router.get(
    "/results/{dispatch_id}",
    status_code=200,
    response_class=FileResponse,
    responses={
        404: {"model": HTTPExceptionSchema, "description": "Result was not found"},
        200: {
            "content": {"application/octet-stream": {}},
            "description": "Return binary content of file.",
        }
    }
)
def get_result(
    *,
    dispatch_id: str,
) -> Any:
    """
    Get a result object as pickle file
    """
    result: bytes = b'\x00\xF0'
    # update logic to db lookup
    if not dispatch_id:
        raise HTTPException(status_code=404, detail="Result not found")
    return StreamingResponse(io.BytesIO(result), media_type="application/octet-stream")



@router.post("/results", status_code=200, response_model=InsertResultResponse)
def insert_result(
    *,
    result_pkl_file: UploadFile,
) -> Any:
    """
    Submit pickled result file
    """
    return {
        "dispatch_id": "e4efd26c-240d-4ab1-9826-26ada91e429f"
    }


@router.put(
    "/results/{dispatch_id}", 
    status_code=200,
    responses={
        404: {"model": HTTPExceptionSchema, "description": "Result was not found"},
        200: {
            "model": UpdateResultResponse,
            "description": "Return message indicating success of updating task",
        }
})
def update_result(
    *,
    dispatch_id: str,
    task: Node
) -> Any:
    """
    Update a result object's task
    """
    # update logic to db lookup
    if not dispatch_id:
        raise HTTPException(status_code=404, detail="Result not found")
    return {
        "response": "Task updated successfully"
    }
