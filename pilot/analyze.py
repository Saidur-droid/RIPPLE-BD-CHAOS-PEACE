#!/usr/bin/env python3
"""Analyze RIPPLE BD rapid-pilot CSV with Python standard library only.

Usage:
  python pilot/analyze.py pilot/pilot-data.csv
"""

import csv
import statistics
import sys
from collections import Counter
from pathlib import Path

REQUIRED = {
    "participant_code", "consent", "baseline_dpds", "post_dpds",
    "completion_minutes", "completed_all", "facilitator_help", "confusion_point"
}

def num(v):
    try:
        v = (v or "").strip()
        return float(v) if v else None
    except ValueError:
        return None

def is_yes(v):
    return (v or "").strip().lower() in {"yes", "y", "true", "1", "হ্যাঁ"}

def clean(v):
    return " ".join((v or "").strip().split())

def avg(xs):
    return statistics.fmean(xs) if xs else None

def fmt(v):
    return "—" if v is None else f"{v:.1f}"

def write_svg(path, baseline, post, n):
    baseline = baseline or 0
    post = post or 0
    def bar(x, value, label):
        height = max(0, min(100, value)) * 2.2
        y = 300 - height
        return (
            f'<rect x="{x}" y="{y:.1f}" width="140" height="{height:.1f}" rx="10" fill="#62ffd4"/>'
            f'<text x="{x+70}" y="{max(65, y-10):.1f}" text-anchor="middle" fill="#f5fbff" '
            f'font-family="Arial" font-size="22" font-weight="700">{value:.1f}</text>'
            f'<text x="{x+70}" y="330" text-anchor="middle" fill="#c8d7df" '
            f'font-family="Arial" font-size="13">{label}</text>'
        )
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="720" height="380" viewBox="0 0 720 380">
<rect width="100%" height="100%" fill="#07111f"/>
<text x="40" y="42" fill="#f5fbff" font-family="Arial" font-size="24" font-weight="700">RIPPLE BD — Preliminary pilot DPDS</text>
<text x="40" y="65" fill="#96abc0" font-family="Arial" font-size="12">Convenience pilot · paired N={n} · uncontrolled · descriptive only</text>
{bar(180, baseline, "Baseline")}
{bar(410, post, "Immediate post")}
<line x1="70" y1="300" x2="650" y2="300" stroke="#294056"/>
</svg>"""
    path.write_text(svg, encoding="utf-8")

def main():
    csv_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("pilot/pilot-data.csv")
    if not csv_path.exists():
        raise SystemExit(f"Pilot CSV not found: {csv_path}")

    with csv_path.open(encoding="utf-8-sig", newline="") as fh:
        reader = csv.DictReader(fh)
        missing = REQUIRED - set(reader.fieldnames or [])
        if missing:
            raise SystemExit("Missing required columns: " + ", ".join(sorted(missing)))
        rows = [r for r in reader if clean(r.get("participant_code"))]

    consented = [r for r in rows if is_yes(r.get("consent"))]
    completed = [r for r in consented if is_yes(r.get("completed_all"))]

    paired = []
    for r in consented:
        b = num(r.get("baseline_dpds"))
        p = num(r.get("post_dpds"))
        if b is not None and p is not None:
            paired.append((b, p))

    baselines = [x[0] for x in paired]
    posts = [x[1] for x in paired]
    changes = [p - b for b, p in paired]
    times = [v for r in completed if (v := num(r.get("completion_minutes"))) is not None]

    help_counts = Counter(clean(r.get("facilitator_help")) or "Missing" for r in consented)
    confusion_counts = Counter(
        clean(r.get("confusion_point")) for r in consented
        if clean(r.get("confusion_point")).lower() not in {"", "none", "no", "n/a", "na"}
    )

    completion_rate = (100 * len(completed) / len(consented)) if consented else None
    baseline_mean = avg(baselines)
    post_mean = avg(posts)
    change_mean = avg(changes)
    median_time = statistics.median(times) if times else None
    top_confusion = confusion_counts.most_common(1)[0][0] if confusion_counts else "No repeated confusion point recorded"

    report = f"""# RIPPLE BD — Pilot Analysis Output

> Preliminary convenience pilot; uncontrolled; not a causal estimate.

## Core evidence

- Participant rows: **{len(rows)}**
- Consented participants: **{len(consented)}**
- Completed all 3 scenarios: **{len(completed)}**
- Completion rate: **{fmt(completion_rate)}%**
- Paired baseline + post DPDS: **{len(paired)}**
- Mean baseline DPDS: **{fmt(baseline_mean)}**
- Mean immediate-post DPDS: **{fmt(post_mean)}**
- Mean DPDS change: **{fmt(change_mean)} points**
- Median completion time: **{fmt(median_time)} minutes**
- Top recorded confusion point: **{top_confusion}**

## Missing data

- Consented but not completed: **{max(0, len(consented)-len(completed))}**
- Missing paired DPDS: **{max(0, len(consented)-len(paired))}**
- Completed without recorded completion time: **{max(0, len(completed)-len(times))}**

## Facilitator help
"""
    for label, count in help_counts.most_common():
        report += f"- {label}: {count}\n"

    report += f"""
## Judge-safe reporting sentence

> In a preliminary convenience pilot of N={len(paired)} participants with paired scores, mean DPDS changed from {fmt(baseline_mean)} to {fmt(post_mean)} immediately after RIPPLE BD ({fmt(change_mean)} points). Because this was a small uncontrolled pilot, this is descriptive evidence, not a causal estimate.

Do not claim causal real-world harm reduction from this pilot alone.
"""

    Path("pilot/analysis-output.md").write_text(report, encoding="utf-8")
    write_svg(Path("pilot/baseline-vs-post.svg"), baseline_mean, post_mean, len(paired))
    print(report)

if __name__ == "__main__":
    main()
