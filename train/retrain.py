#!/usr/bin/env python3
"""
Yele ukulele chord model retraining script.

Usage:
    # Use existing video-extracted CSV + new browser-collected JSON:
    python train/retrain.py --csv yele-model/data/dataset.csv --data collected.json

    # CSV only (no new data yet):
    python train/retrain.py --csv yele-model/data/dataset.csv

    # New data only:
    python train/retrain.py --data collected.json

Input formats:
    CSV  (from extract.py):  x0,y0,z0,...,x20,y20,z20,label  (no header)
    JSON (from /collect):    [{"label": "C_major", "features": [x0,y0,z0,...]}, ...]

Output:
    public/web_model/model.json  (+ weight shards)
    public/labels.json

IMPORTANT — normalization:
    Features are normalised to be wrist-relative and scale-invariant before
    training. The live app (ChordCamera.tsx) applies the same normalisation
    before inference. Both must stay in sync.
"""

import argparse
import csv
import json
import sys
from pathlib import Path

import numpy as np

# ---------------------------------------------------------------------------
# Args
# ---------------------------------------------------------------------------

parser = argparse.ArgumentParser(description="Retrain Yele chord model")
parser.add_argument("--csv",  nargs="+", default=[], help="CSV file(s) from extract.py")
parser.add_argument("--data", nargs="+", default=[], help="JSON file(s) from /collect page")
parser.add_argument("--epochs", type=int,   default=80,   help="Max epochs (default 80)")
parser.add_argument("--batch",  type=int,   default=32,   help="Batch size (default 32)")
parser.add_argument("--val",    type=float, default=0.15, help="Validation split (default 0.15)")
parser.add_argument(
    "--out",
    default=str(Path(__file__).parent.parent / "public" / "web_model"),
    help="TF.js output directory (default ../public/web_model)",
)
parser.add_argument(
    "--labels-out",
    default=str(Path(__file__).parent.parent / "public" / "labels.json"),
    help="labels.json output path (default ../public/labels.json)",
)
args = parser.parse_args()

if not args.csv and not args.data:
    sys.exit("ERROR: provide at least one --csv or --data file")

# ---------------------------------------------------------------------------
# Load samples
# ---------------------------------------------------------------------------

samples: list[dict] = []   # {"label": str, "features": list[float]}

# -- CSV files (format: 63 floats then label, no header) -------------------
for path in args.csv:
    count = 0
    with open(path, newline="") as f:
        for row in csv.reader(f):
            if len(row) != 64:
                continue   # skip malformed rows
            try:
                feats = [float(v) for v in row[:63]]
                label = row[63].strip()
                samples.append({"label": label, "features": feats})
                count += 1
            except ValueError:
                continue
    print(f"CSV  {path}: {count} samples loaded")

# -- JSON files (format: [{label, features}, ...]) -------------------------
for path in args.data:
    with open(path) as f:
        chunk = json.load(f)
    if not isinstance(chunk, list):
        sys.exit(f"ERROR: {path} must be a JSON array")
    count = len(chunk)
    samples.extend(chunk)
    print(f"JSON {path}: {count} samples loaded")

print(f"\nTotal raw samples: {len(samples)}")
if not samples:
    sys.exit("ERROR: no samples found")

# ---------------------------------------------------------------------------
# Build label set  (canonical order so label indices stay consistent)
# ---------------------------------------------------------------------------

CANONICAL_CHORDS = [
    "A_major", "Am_minor", "C_major", "Csharp_major",
    "D_major", "Dm_minor", "F_major", "G_major",
]

present = set(s["label"] for s in samples)
unknown = [l for l in sorted(present) if l not in CANONICAL_CHORDS and l != "no_ukulele"]
if unknown:
    print(f"WARNING: unknown labels will be included: {unknown}")

labels: list[str] = [c for c in CANONICAL_CHORDS if c in present]
labels += unknown
if "no_ukulele" in present:
    labels.append("no_ukulele")

label_to_idx = {l: i for i, l in enumerate(labels)}
n_classes = len(labels)
print(f"\nClasses ({n_classes}): {labels}")

# Per-class counts
from collections import Counter
raw_counts = Counter(s["label"] for s in samples)
for l in labels:
    print(f"  {l:20s}: {raw_counts.get(l, 0)} samples")

# ---------------------------------------------------------------------------
# Build X, y  (filter bad rows)
# ---------------------------------------------------------------------------

X_list, y_list = [], []
skipped = 0
for s in samples:
    feats = s.get("features")
    lbl   = s.get("label")
    if not feats or len(feats) != 63 or lbl not in label_to_idx:
        skipped += 1
        continue
    X_list.append(feats)
    y_list.append(label_to_idx[lbl])

if skipped:
    print(f"\nSkipped {skipped} malformed samples")

X = np.array(X_list, dtype=np.float32)
y = np.array(y_list, dtype=np.int32)
print(f"Dataset shape: X={X.shape}, y={y.shape}")

if len(X) < 50:
    sys.exit("ERROR: too few valid samples (<50). Collect more data first.")

# ---------------------------------------------------------------------------
# Normalise — wrist-relative + scale-invariant
#
# This MUST match the normalisation in ChordCamera.tsx (normaliseFeatures).
# 1. Subtract wrist (landmark 0) so position doesn't matter
# 2. Divide by wrist→middle-MCP distance so hand size doesn't matter
# ---------------------------------------------------------------------------

def normalise(X: np.ndarray) -> np.ndarray:
    out = X.copy().reshape(-1, 21, 3)
    wrist = out[:, 0:1, :]          # shape (N, 1, 3)
    out  -= wrist
    scale = np.linalg.norm(out[:, 9, :], axis=1, keepdims=True)  # wrist→middle-MCP
    scale = np.maximum(scale, 1e-6).reshape(-1, 1, 1)
    out  /= scale
    return out.reshape(-1, 63)

X = normalise(X)

# ---------------------------------------------------------------------------
# Class weights (balances no_ukulele / minority classes)
# ---------------------------------------------------------------------------

cnt = Counter(y_list)
max_count = max(cnt.values())
class_weight = {i: max_count / cnt[i] for i in cnt}
print("\nClass weights:")
for i, l in enumerate(labels):
    print(f"  {l:20s}: {class_weight.get(i, 1.0):.2f}×")

# ---------------------------------------------------------------------------
# Shuffle + split
# ---------------------------------------------------------------------------

rng = np.random.default_rng(42)
perm = rng.permutation(len(X))
X, y = X[perm], y[perm]

val_n = max(1, int(len(X) * args.val))
X_val, y_val = X[:val_n], y[:val_n]
X_tr,  y_tr  = X[val_n:], y[val_n:]
print(f"\nTrain: {len(X_tr)}, Val: {len(X_val)}")

# ---------------------------------------------------------------------------
# Model
# ---------------------------------------------------------------------------

try:
    import tensorflow as tf
    from tensorflow import keras
except ImportError:
    sys.exit("ERROR: run:  pip install tensorflow tensorflowjs")

model = keras.Sequential([
    keras.layers.Input(shape=(63,)),
    keras.layers.Dense(256, activation="relu"),
    keras.layers.Dropout(0.3),
    keras.layers.Dense(128, activation="relu"),
    keras.layers.Dropout(0.2),
    keras.layers.Dense(64, activation="relu"),
    keras.layers.Dense(n_classes, activation="softmax"),
], name="yele_chord_model")

model.compile(
    optimizer=keras.optimizers.Adam(1e-3),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"],
)
model.summary()

# ---------------------------------------------------------------------------
# Train
# ---------------------------------------------------------------------------

callbacks = [
    keras.callbacks.EarlyStopping(monitor="val_accuracy", patience=12,
                                   restore_best_weights=True, verbose=1),
    keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.4,
                                       patience=6, min_lr=1e-6, verbose=1),
]

print(f"\nTraining for up to {args.epochs} epochs…")
history = model.fit(
    X_tr, y_tr,
    validation_data=(X_val, y_val),
    epochs=args.epochs,
    batch_size=args.batch,
    class_weight=class_weight,
    callbacks=callbacks,
    verbose=1,
)

best = max(history.history.get("val_accuracy", [0]))
print(f"\nBest val accuracy: {best:.4f} ({best*100:.1f}%)")
if best < 0.85:
    print("WARNING: accuracy below 85% — consider collecting more data")

# ---------------------------------------------------------------------------
# Export to TF.js
# ---------------------------------------------------------------------------

try:
    import tensorflowjs as tfjs
except ImportError:
    sys.exit("ERROR: run:  pip install tensorflowjs")

out_dir = Path(args.out)
out_dir.mkdir(parents=True, exist_ok=True)
print(f"\nExporting to {out_dir}…")
tfjs.converters.save_keras_model(model, str(out_dir))

# ---------------------------------------------------------------------------
# Patch model.json from Keras v3 format → TF.js-compatible format
#
# tensorflowjs_converter emits Keras v3 fields that tfjs loadLayersModel
# cannot parse. We fix them in-place so the browser can load the model.
# ---------------------------------------------------------------------------

model_json_path = out_dir / "model.json"
with open(model_json_path) as f:
    mj = json.load(f)

topo = mj["modelTopology"]
if "model_config" in topo:
    mc = topo["model_config"]
    mj["modelTopology"] = {"class_name": mc["class_name"], "config": mc["config"]}
    topo = mj["modelTopology"]

topo["config"].pop("build_input_shape", None)

def _fix_dtype(v):
    return v["config"]["name"] if isinstance(v, dict) and v.get("class_name") == "DTypePolicy" else v

def _fix_init(v):
    return {"class_name": v["class_name"], "config": v.get("config", {})} if isinstance(v, dict) and "class_name" in v else v

if "dtype" in topo["config"]:
    topo["config"]["dtype"] = _fix_dtype(topo["config"]["dtype"])

for layer in topo["config"].get("layers", []):
    cfg = layer.get("config", {})
    if "dtype" in cfg:
        cfg["dtype"] = _fix_dtype(cfg["dtype"])
    if layer["class_name"] == "InputLayer":
        if "batch_shape" in cfg:
            cfg["batchInputShape"] = cfg.pop("batch_shape")
        cfg.pop("ragged", None)
    for k in ("kernel_initializer", "bias_initializer"):
        if k in cfg:
            cfg[k] = _fix_init(cfg[k])

with open(model_json_path, "w") as f:
    json.dump(mj, f, separators=(",", ":"))

print("model.json patched for TF.js compatibility")

# ---------------------------------------------------------------------------

labels_path = Path(args.labels_out)
labels_path.parent.mkdir(parents=True, exist_ok=True)
with open(labels_path, "w") as f:
    json.dump(labels, f, indent=2)

print(f"Labels → {labels_path}")
print("\nDone. Commit public/web_model/ and public/labels.json, then redeploy.")
