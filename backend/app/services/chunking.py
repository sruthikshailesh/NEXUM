"""Chunking: ~900 tokens per chunk, small overlap, page preserved per chunk."""

import math

from ..config import CHUNK_OVERLAP_TOKENS, CHUNK_TARGET_TOKENS
from .extraction import ExtractionResult

# No tokenizer dependency: 1 word is roughly 1.3 tokens for English prose.
WORDS_PER_TOKEN = 1.3


def estimate_tokens(text: str) -> int:
    return max(1, math.ceil(len(text.split()) * WORDS_PER_TOKEN))


def _split_words(text: str, target_words: int, overlap_words: int) -> list[str]:
    words = text.split()
    if not words:
        return []
    if len(words) <= target_words:
        return [" ".join(words)]

    step = max(1, target_words - overlap_words)
    chunks: list[str] = []
    for start in range(0, len(words), step):
        window = words[start : start + target_words]
        if not window:
            break
        chunks.append(" ".join(window))
        if start + target_words >= len(words):
            break
    return chunks


def build_chunks(extraction: ExtractionResult) -> list[dict]:
    """Return [{chunk_index, page, text, token_estimate}] across the whole document."""
    target_words = max(50, int(CHUNK_TARGET_TOKENS / WORDS_PER_TOKEN))
    overlap_words = max(0, int(CHUNK_OVERLAP_TOKENS / WORDS_PER_TOKEN))

    result: list[dict] = []
    index = 0
    for page, page_text in extraction.pages:
        if not page_text.strip():
            continue
        for piece in _split_words(page_text, target_words, overlap_words):
            result.append(
                {
                    "chunk_index": index,
                    "page": page,
                    "text": piece,
                    "token_estimate": estimate_tokens(piece),
                }
            )
            index += 1
    return result
