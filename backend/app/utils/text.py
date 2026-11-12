"""Text helpers used for quote verification and display."""

import re
import unicodedata

_WHITESPACE = re.compile(r"\s+")
_QUOTES = str.maketrans({"\u2018": "'", "\u2019": "'", "\u201c": '"', "\u201d": '"'})
_DASHES = str.maketrans({"\u2013": "-", "\u2014": "-", "\u2212": "-"})


def normalize_text(value: str) -> str:
    """Normalize text so a model quote can be matched against stored chunks.

    Differences in whitespace, curly quotes and dashes are ignored; words are not.
    """
    if not value:
        return ""
    text = unicodedata.normalize("NFKC", value).translate(_QUOTES).translate(_DASHES)
    text = text.replace("\u00a0", " ")
    return _WHITESPACE.sub(" ", text).strip().lower()


def human_size(size_bytes: int) -> str:
    if size_bytes >= 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.1f} MB"
    if size_bytes >= 1024:
        return f"{size_bytes / 1024:.1f} KB"
    return f"{size_bytes} B"
