"""Evidence verification: a citation is only kept if its quote exists in a chunk."""

from sqlalchemy.orm import Session

from ..models.source import Chunk
from ..utils.text import normalize_text

MIN_QUOTE_LENGTH = 8


class ChunkIndex:
    """Lookup structure for one analysis run: source_id -> chunks."""

    def __init__(self, chunks: list[Chunk], source_names: dict[str, str]):
        self.chunks_by_source: dict[str, list[Chunk]] = {}
        self.names = source_names
        for chunk in chunks:
            self.chunks_by_source.setdefault(chunk.source_id, []).append(chunk)
        self._normalized: dict[str, str] = {
            chunk.id: normalize_text(chunk.text) for chunk in chunks
        }

    def find(self, source_id: str, quote: str) -> tuple[Chunk, int | None] | None:
        """Return the matching chunk and its page, or None when the quote is not there."""
        cleaned = normalize_text(quote)
        if len(cleaned) < MIN_QUOTE_LENGTH or source_id not in self.chunks_by_source:
            return None
        for chunk in self.chunks_by_source[source_id]:
            if cleaned in self._normalized[chunk.id]:
                return chunk, chunk.page
        return None


def build_chunk_index(db: Session, source_ids: list[str], names: dict[str, str]) -> ChunkIndex:
    chunks = (
        db.query(Chunk)
        .filter(Chunk.source_id.in_(source_ids))
        .order_by(Chunk.source_id, Chunk.chunk_index)
        .all()
    )
    return ChunkIndex(chunks, names)
