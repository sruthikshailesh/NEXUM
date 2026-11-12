"""Groq JSON-mode client. The API key never leaves the backend."""

import json
import time

from ..config import GROQ_API_KEY, GROQ_MODEL, GROQ_TIMEOUT_SECONDS
from ..utils.errors import AppError


class InvalidModelOutput(Exception):
    """The model answered, but not with valid JSON. Callers may retry once."""


_client = None


def _get_client():
    global _client
    if not GROQ_API_KEY:
        raise AppError(
            "groq_not_configured",
            "AI analysis is not configured yet. Add GROQ_API_KEY to backend/.env and restart the server.",
            503,
        )
    if _client is None:
        from groq import Groq

        _client = Groq(api_key=GROQ_API_KEY, timeout=GROQ_TIMEOUT_SECONDS)
    return _client


def call_groq_json(system_prompt: str, user_prompt: str) -> dict:
    """Ask Groq for a JSON object, retrying rate limits and timeouts a little."""
    from groq import (
        APIConnectionError,
        APIStatusError,
        APITimeoutError,
        AuthenticationError,
        BadRequestError,
        RateLimitError,
    )

    client = _get_client()
    last_error: Exception | None = None

    for attempt in range(3):
        try:
            completion = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.1,
                max_tokens=3000,
                response_format={"type": "json_object"},
                timeout=GROQ_TIMEOUT_SECONDS,
            )
            content = (completion.choices[0].message.content or "").strip()
            if not content:
                raise AppError(
                    "groq_empty_response",
                    "The AI service returned an empty response. Please try the analysis again.",
                    502,
                )
            try:
                return json.loads(content)
            except json.JSONDecodeError as exc:
                raise InvalidModelOutput("The AI response was not valid JSON.") from exc
        except RateLimitError as exc:
            last_error = exc
            if attempt < 2:
                time.sleep(2 * (attempt + 1))  # small backoff for free-tier limits
                continue
            raise AppError(
                "groq_rate_limited",
                "The AI service is temporarily rate limited. Wait a minute and try again; "
                "your uploads and analysis progress are safe.",
                429,
            ) from exc
        except APITimeoutError as exc:
            last_error = exc
            if attempt == 0:
                continue
            raise AppError(
                "groq_timeout",
                "The AI service took too long to respond. Try analyzing fewer sources at once.",
                504,
            ) from exc
        except AuthenticationError as exc:
            raise AppError(
                "groq_auth_failed",
                "The AI service rejected the API key. Check GROQ_API_KEY in backend/.env.",
                503,
            ) from exc
        except BadRequestError as exc:
            raise AppError(
                "groq_bad_request",
                "The AI service rejected this request. Try a smaller source selection.",
                502,
            ) from exc
        except APIConnectionError as exc:
            raise AppError(
                "groq_unreachable",
                "Could not reach the AI service. Check the server's internet connection and retry.",
                502,
            ) from exc
        except APIStatusError as exc:
            raise AppError(
                "groq_error",
                f"The AI service returned an error (HTTP {exc.status_code}). Please try again later.",
                502,
            ) from exc

    raise AppError("groq_error", "The AI service is unavailable right now. Please retry.", 502)
