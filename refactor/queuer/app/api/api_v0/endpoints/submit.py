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


from app.core.queue import Queuer
from app.schemas.submit import ResultPickle, SubmitResponse
from fastapi import APIRouter

router = APIRouter()


@router.post("/dispatch", status_code=202, response_model=SubmitResponse)
async def submit_workflow(*, result: ResultPickle) -> SubmitResponse:
    """
    Submit a workflow
    """

    queue = Queuer()
    await queue.publish("foo", {"message": "hi"})

    return {"dispatch_id": "48f1d3b7-27bb-4c5d-97fe-c0c61c197fd5"}