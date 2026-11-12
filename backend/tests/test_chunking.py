from app.services.chunking import build_chunks, estimate_tokens
from app.services.extraction import ExtractionResult


def test_chunks_keep_page_numbers_and_overlap():
    page_one = " ".join(f"word{i}" for i in range(2000))
    page_two = " ".join(f"second{i}" for i in range(600))
    extraction = ExtractionResult(
        text=page_one + "\n\n" + page_two,
        pages=[(1, page_one), (2, page_two)],
        page_count=2,
    )
    chunks = build_chunks(extraction)

    assert len(chunks) >= 4
    assert chunks[0]["page"] == 1
    assert chunks[-1]["page"] == 2
    assert [chunk["chunk_index"] for chunk in chunks] == list(range(len(chunks)))
    assert all(chunk["token_estimate"] <= 1000 for chunk in chunks)

    # Consecutive chunks on the same page share the overlap window (~100 tokens).
    first_words = chunks[0]["text"].split()
    second_words = chunks[1]["text"].split()
    assert set(first_words[-60:]) & set(second_words[:60])


def test_short_text_is_one_chunk():
    extraction = ExtractionResult(text="A short note.", pages=[(None, "A short note.")])
    chunks = build_chunks(extraction)
    assert len(chunks) == 1
    assert chunks[0]["page"] is None
    assert estimate_tokens("one two three") >= 1
