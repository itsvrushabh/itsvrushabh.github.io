#!/usr/bin/env python3
"""
Language Radar Updater Bot
Automatically fetches current & next versions of Python and Rust,
retrieves their top 3 architectural innovations, and updates README.md.
"""

import json
import re
import sys
import urllib.request
from pathlib import Path

README_PATH = Path(__file__).resolve().parent.parent / "README.md"

START_MARKER = "<!-- START_LANGUAGE_RADAR -->"
END_MARKER = "<!-- END_LANGUAGE_RADAR -->"

# Knowledge base of core architectural innovations per version
PYTHON_FEATURES = {
    "3.12": {
        "focus": "Perf & Comprehensions",
        "top3": [
            "**Isolated Subinterpreters (PEP 684):** Per-interpreter GIL enabling CPU scalability.",
            "**Inlined Comprehensions:** Faster execution by eliminating hidden function frames.",
            "**Type Parameter Syntax (PEP 695):** Clean `class MyClass[T]:` generic syntax.",
        ],
    },
    "3.13": {
        "focus": "Concurrency & JIT",
        "top3": [
            "**Free-Threaded CPython (No-GIL / PEP 703):** True multi-core parallel thread execution.",
            "**Tier-1 JIT Compiler (PEP 744):** Copy-and-patch JIT engine accelerating hot bytecode.",
            "**Enhanced Interactive REPL:** Built-in multiline editor, colorized tracebacks, and inline docs.",
        ],
    },
    "3.14": {
        "focus": "Typing & Metaprogramming",
        "top3": [
            "**Deferred Annotations (PEP 649):** Type hints evaluated lazily on demand without runtime cost.",
            "**Template Strings (PEP 750):** Native `t-strings` for injection-safe, structured templating.",
            "**Tier-2 JIT Optimizations:** Micro-op tracing and deep interpreter tail-call speedups.",
        ],
    },
    "3.15": {
        "focus": "Subinterpreters & JIT Maturity",
        "top3": [
            "**Standard Free-Threading Stability:** Full ecosystem C-extension stabilization for No-GIL.",
            "**Advanced Tier-2 Trace JIT:** Native machine-code generation for hot instruction traces.",
            "**Zero-Cost Exception Refinements:** Near-zero overhead for try/except blocks on happy paths.",
        ],
    },
}

RUST_FEATURES = {
    "1.96": {
        "focus": "Diagnostics & Standard Library",
        "top3": [
            "**Const Context Enhancements:** Expanded standard library functions usable in const evaluation.",
            "**Lifetime Elision Refinements:** More intuitive defaults in complex generic signatures.",
            "**Linker & Diagnostic Improvements:** Better error reporting for symbol mismatches.",
        ],
    },
    "1.97": {
        "focus": "Compiler Performance & Traits",
        "top3": [
            "**Parallel Frontend Optimization:** Reduced compile times across large multi-crate workspaces.",
            "**Trait Solver Refinement:** Next-generation Trait Solver stability improvements.",
            "**Platform Support Additions:** Broadened tier-2 target support for modern architectures.",
        ],
    },
    "1.98": {
        "focus": "Concurrency & Ergonomics",
        "top3": [
            "**Async Closures:** Ergonomic borrow capturing across await points in `async |x|`.",
            "**Let Chains:** Flattened conditional matching (`if let Some(x) = opt && x > 0`).",
            "**`gen` Blocks & Yield:** First-class coroutine iterators without handwritten state machine boilerplate.",
        ],
    },
    "1.99": {
        "focus": "Memory Safety & Expressiveness",
        "top3": [
            "**Async Drop:** Automated asynchronous destructor cleanup for sockets and DB transactions.",
            "**Dyn Trait Upcasting:** Native sub-to-super trait coercion without manual wrapper shims.",
            "**Advanced Const Generics:** Compile-time evaluations and arbitrary expressions in types.",
        ],
    },
    "2.0": {
        "focus": "Next-Gen Architecture",
        "top3": [
            "**Next-Gen Chalk Trait Engine:** Formally proven trait resolution algorithm default.",
            "**Full Coroutines Specification:** Universal generator and async generator primitives.",
            "**Polymorphic Memory Models:** Deeper static analysis for hardware-level concurrency.",
        ],
    },
}


def fetch_json(url: str, timeout: int = 10):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "LanguageRadarBot/1.0"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        print(f"[WARN] Failed to fetch {url}: {e}", file=sys.stderr)
        return None


def get_python_versions():
    data = fetch_json("https://endoflife.date/api/python.json")
    if data and isinstance(data, list):
        cycles = [item["cycle"] for item in data if "cycle" in item]
        # Current stable is typically the first supported or active release
        # Fallback to standard 3.13 / 3.14 if API changes
        if "3.13" in cycles:
            curr = "3.13"
            nxt = "3.14"
            if cycles[0] == "3.14":
                curr = "3.14"
                nxt = "3.15"
            return curr, nxt
    return "3.13", "3.14"


def get_rust_versions():
    data = fetch_json("https://endoflife.date/api/rust.json")
    if data and isinstance(data, list):
        cycles = [item["cycle"] for item in data if "cycle" in item]
        if cycles:
            curr = cycles[0]  # e.g. "1.98"
            try:
                major, minor = curr.split(".")
                nxt = f"{major}.{int(minor) + 1}+"
            except Exception:
                nxt = "1.99+"
            return curr, nxt
    return "1.98", "1.99+"


def build_markdown(py_curr: str, py_next: str, rust_curr: str, rust_next: str) -> str:
    # Python feature lookups
    py_c_info = PYTHON_FEATURES.get(
        py_curr,
        {
            "focus": "Runtime & Concurrency",
            "top3": [
                "Performance optimizations and JIT compilation improvements.",
                "Ecosystem typing enhancements and lazy evaluation.",
                "Interpreter and memory management refinements.",
            ],
        },
    )
    py_n_info = PYTHON_FEATURES.get(
        py_next,
        {
            "focus": "Typing & Metaprogramming",
            "top3": [
                "Deferred evaluation of annotations (PEP 649).",
                "Structured template strings (t-strings / PEP 750).",
                "Advanced Tier-2 trace JIT optimizations.",
            ],
        },
    )

    # Rust feature lookups
    rust_c_key = rust_curr.split("+")[0]
    rust_n_key = rust_next.split("+")[0]

    rust_c_info = RUST_FEATURES.get(
        rust_c_key,
        {
            "focus": "Concurrency & Ergonomics",
            "top3": [
                "Async Closures borrow capturing across await points.",
                "Let chains conditional pattern matching.",
                "Iterator generator coroutine blocks with yield.",
            ],
        },
    )
    rust_n_info = RUST_FEATURES.get(
        rust_n_key,
        {
            "focus": "Memory Safety & Expressiveness",
            "top3": [
                "Async Drop for automated async destructor cleanup.",
                "Dyn Trait Upcasting without wrapper shims.",
                "Advanced Const Generics expressions in type parameters.",
            ],
        },
    )

    py_c_top3 = "<br>".join(f"{i+1}. {item}" for i, item in enumerate(py_c_info["top3"]))
    py_n_top3 = "<br>".join(f"{i+1}. {item}" for i, item in enumerate(py_n_info["top3"]))
    rust_c_top3 = "<br>".join(f"{i+1}. {item}" for i, item in enumerate(rust_c_info["top3"]))
    rust_n_top3 = "<br>".join(f"{i+1}. {item}" for i, item in enumerate(rust_n_info["top3"]))

    edition_label = " / 2024" if rust_curr.startswith("1.98") or rust_curr.startswith("1.85") else ""

    md = f"""{START_MARKER}
## 🔬 Language Radar: Python & Rust Evolution
*Tracking cutting-edge runtime shifts, compiler internals, and upcoming language proposals.*

<br />

### 🐍 Python Track

<div align="center">
  <img src="https://img.shields.io/badge/Python_{py_curr}-Current_Stable-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python {py_curr}" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://img.shields.io/badge/Python_{py_next}-Coming_Soon-F7C844?style=flat-square&logo=python&logoColor=black" alt="Python {py_next}" />
</div>

<br />

| Release | Architectural Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
| **🟢 Current: {py_curr}** | {py_c_info["focus"]} | {py_c_top3} |
| **🚀 Next: {py_next}** | {py_n_info["focus"]} | {py_n_top3} |

<br />

### 🦀 Rust Track

<div align="center">
  <img src="https://img.shields.io/badge/Rust_{rust_curr}-Current_Stable-000000?style=flat-square&logo=rust&logoColor=white" alt="Rust {rust_curr}" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://img.shields.io/badge/Rust_{rust_next}-In_Pipeline-DEA584?style=flat-square&logo=rust&logoColor=black" alt="Rust {rust_next}" />
</div>

<br />

| Release | Systems Focus | Top 3 Core Innovations |
| :--- | :--- | :--- |
| **🟢 Current: {rust_curr}{edition_label}** | {rust_c_info["focus"]} | {rust_c_top3} |
| **🚀 Next: {rust_next}** | {rust_n_info["focus"]} | {rust_n_top3} |
{END_MARKER}"""
    return md


def main():
    print("🔍 Fetching current & next release data for Python and Rust...")
    py_curr, py_next = get_python_versions()
    rust_curr, rust_next = get_rust_versions()

    print(f"🐍 Python: Current={py_curr}, Next={py_next}")
    print(f"🦀 Rust:   Current={rust_curr}, Next={rust_next}")

    if not README_PATH.exists():
        print(f"❌ Error: {README_PATH} not found.", file=sys.stderr)
        sys.exit(1)

    content = README_PATH.read_text(encoding="utf-8")

    if START_MARKER not in content or END_MARKER not in content:
        print("❌ Error: Boundary markers not found in README.md.", file=sys.stderr)
        sys.exit(1)

    new_block = build_markdown(py_curr, py_next, rust_curr, rust_next)

    pattern = re.compile(
        re.escape(START_MARKER) + r".*?" + re.escape(END_MARKER),
        re.DOTALL,
    )

    updated_content = pattern.sub(new_block, content)

    if updated_content == content:
        print("✅ README.md is already up to date with the latest language versions.")
    else:
        README_PATH.write_text(updated_content, encoding="utf-8")
        print("🎉 Successfully updated Language Radar section in README.md!")


if __name__ == "__main__":
    main()
