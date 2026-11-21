"""EDMS SSO Authentication module for ops-workflow.

Handles WebSocket connection to local SSO agent (port 28083),
retrieves the TS-SSO token, exchanges it for an authenticated session cookie,
and maintains the EDMS session for subsequent drawing/document queries and CAD validation.
Extracted and normalized from Data.xlsb (Sheet 4).
"""

from __future__ import annotations

import logging
import traceback
from typing import Any, Callable

try:
    import requests
except ImportError:
    requests = None

try:
    import websocket
except ImportError:
    websocket = None

logger = logging.getLogger(__name__)


class EDMSAuth:
    """Handles WebSocket connection to retrieve SSO Token and exchange for EDMS session cookie."""

    HOST: str = "http://edms.lgdisplay.com:8080"
    SSO_HOST: str = "http://im.lgdisplay.com:8088"
    WS_AGENT_URL: str = "ws://127.0.0.1:28083/"

    def __init__(
        self,
        session: Any = None,
        host: str | None = None,
        sso_host: str | None = None,
        ws_agent_url: str | None = None,
        log_callback: Callable[[str], None] | None = None,
    ) -> None:
        if session is not None:
            self.session = session
        elif requests is not None:
            self.session = requests.Session()
        else:
            self.session = None

        if host:
            self.HOST = host
        if sso_host:
            self.SSO_HOST = sso_host
        if ws_agent_url:
            self.WS_AGENT_URL = ws_agent_url

        self.log_callback = log_callback
        self.is_authenticated: bool = False
        self.last_token: str | None = None
        self.session_cookies: dict[str, str] = {}

    def _log(self, message: str) -> None:
        logger.info(message)
        if self.log_callback:
            self.log_callback(message)

    def _get_sso_token(self) -> str:
        """Connect to local SSO WebSocket agent on port 28083 and request GETTOKEN."""
        if websocket is None:
            raise RuntimeError("websocket-client package is required for local SSO agent connection")

        ws = websocket.create_connection(
            self.WS_AGENT_URL,
            header={"Origin": self.HOST},
            timeout=10,
        )
        try:
            sso_host_clean = self.SSO_HOST.replace("http://", "").replace("https://", "")
            ws.send(
                f"API?args=tsso://{sso_host_clean}/GETTOKEN"
                f"?apiroot=/pdadmin&protocol=http&pd_h=null&pd_id=null"
            )
            token = ws.recv()
        finally:
            ws.close()
        return str(token) if token else ""

    def authenticate(self) -> bool:
        """Complete SSO authentication flow."""
        if self.session is None and requests is not None:
            self.session = requests.Session()

        if self.session is None:
            self._log("[AUTH ERROR] requests.Session() is not initialized!")
            return False

        try:
            self._log("[AUTH] Initializing EDMS session...")
            try:
                self.session.get(
                    f"{self.HOST}/Servlet/MainContent.do",
                    timeout=15,
                    allow_redirects=True,
                )
            except Exception as e:
                self._log(f"[AUTH ERROR] Cannot connect to EDMS host: {e}")
                logger.debug(traceback.format_exc())
                return False

            self._log("[AUTH] Acquiring SSO Token from local Agent (ws://127.0.0.1:28083/)...")
            try:
                token = self._get_sso_token()
            except Exception as e:
                self._log(
                    f"[AUTH ERROR] Failed to obtain SSO token (Local SSO agent not running on port 28083?): {e}"
                )
                logger.debug(traceback.format_exc())
                return False

            if not token:
                self._log("[AUTH ERROR] SSO agent returned empty token.")
                return False

            self.last_token = token
            self._log("[AUTH] Exchanging Token for authenticated session cookie...")
            sso_url = f"{self.SSO_HOST}/pdadmin/eai/eai.jsp"
            params = {
                "url": f"{self.HOST}/Servlet/MainContent.do",
                "token": token,
            }

            try:
                resp = self.session.get(
                    sso_url, params=params, allow_redirects=True, timeout=15
                )
            except Exception as e:
                self._log(f"[AUTH ERROR] Token exchange request failed: {e}")
                logger.debug(traceback.format_exc())
                return False

            if resp.status_code >= 400:
                self._log(f"[AUTH ERROR] Server returned HTTP {resp.status_code} during token exchange.")
                return False

            if hasattr(self.session, "cookies"):
                self.session_cookies = self.session.cookies.get_dict()

            self.is_authenticated = True
            self._log("[AUTH] EDMS SSO Authentication successful!")
            return True

        except Exception as e:
            self._log(f"[AUTH ERROR] Unhandled exception during SSO: {e}")
            logger.debug(traceback.format_exc())
            return False
