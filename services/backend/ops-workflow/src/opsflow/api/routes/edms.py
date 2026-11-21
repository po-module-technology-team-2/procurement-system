"""API routes for EDMS SSO authentication."""

from typing import Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from opsflow.auth.edms_auth import EDMSAuth

router = APIRouter(prefix="/auth/edms", tags=["EDMS Authentication"])

_edms_auth_instance = EDMSAuth()


class EDMSAuthResponse(BaseModel):
    success: bool
    message: str
    edms_host: str
    sso_host: str
    last_token: str | None = None
    cookies_present: list[str] = []


@router.get("/status", response_model=dict[str, Any])
async def get_edms_status() -> dict[str, Any]:
    """Check EDMS SSO authentication status and configuration."""
    return {
        "is_authenticated": _edms_auth_instance.is_authenticated,
        "edms_host": _edms_auth_instance.HOST,
        "sso_host": _edms_auth_instance.SSO_HOST,
        "ws_agent_url": _edms_auth_instance.WS_AGENT_URL,
        "has_token": _edms_auth_instance.last_token is not None,
        "cookies": list(_edms_auth_instance.session_cookies.keys()),
    }


@router.post("/authenticate", response_model=EDMSAuthResponse)
async def trigger_edms_authenticate() -> EDMSAuthResponse:
    """Execute full SSO authentication against local SSO agent on port 28083 and EDMS."""
    success = _edms_auth_instance.authenticate()
    return EDMSAuthResponse(
        success=success,
        message="EDMS SSO authentication successful" if success else "EDMS SSO authentication failed (check local agent on port 28083)",
        edms_host=_edms_auth_instance.HOST,
        sso_host=_edms_auth_instance.SSO_HOST,
        last_token=_edms_auth_instance.last_token,
        cookies_present=list(_edms_auth_instance.session_cookies.keys()),
    )
