# 🛡️ Deepfake_realtime — Real-Time Deepfake Detection with a Trust Meta-Classifier

Detect deepfakes live from a webcam, a video-call window, or a video file. Faces are detected with **MTCNN**, classified **REAL / FAKE** by an **InceptionResnetV1** model, and every verdict is double-checked by a second **Trust Meta-Classifier** that reports whether the primary prediction can be relied on.

![Python](https://img.shields.io/badge/Python-3.12-blue)
![PyTorch](https://img.shields.io/badge/PyTorch-2.x-EE4C2C)
![OpenCV](https://img.shields.io/badge/OpenCV-4.9+-green)


> Forked from [pseudoHacks/Deepfake_realtime](https://github.com/pseudoHacks/Deepfake_realtime).

---

## ✨ Features

- **Real-time inference** on webcam (any index) or video files, with an on-screen FPS counter
- **Multi-face detection** using MTCNN, with a configurable minimum face size
- **Two-stage verdicts**
  - Primary classifier → `REAL` / `FAKE` / `UNKNOWN` (below the confidence threshold)
  - Trust Meta-Classifier → `TRUSTED` / `UNTRUSTED` / `NEEDS_REVIEW`
- **Auto-correction:** if the trust model marks a prediction `UNTRUSTED`, the label is flipped; `NEEDS_REVIEW` is highlighted in amber
- **Video-call friendly:** run alongside Zoom / Google Meet / Teams, or pipe through OBS Virtual Camera
- **Live controls:** quit, save screenshots, and cycle the confidence threshold without restarting
- **Fine-tuning pipeline** to adapt the model to your own real/fake footage while avoiding catastrophic forgetting
- **Full-stack demo:** FastAPI server plus `backend/` and `frontend/` apps

---

## 🧠 How It Works

```
Frame (webcam / video)
        │
        ▼
 MTCNN face detection  ──►  crop each face (299×299)
        │
        ▼
 InceptionResnetV1 backbone (VGGFace2 pretrained) ──► 512-d embedding
        │                                                  │
        ▼                                                  ▼
 Classification head ──► REAL / FAKE + confidence    Trust Meta-Classifier
        │                                            (embedding + prediction + confidence)
        └──────────────────────┬───────────────────────────┘
                               ▼
              Overlay: bounding box, label, trust badge, FPS
```

**Primary model:** InceptionResnetV1 (`vggface2` weights) followed by a 3-layer head: `512 → 256 → 128 → 2`, with BatchNorm, GELU and Dropout (0.4 / 0.3).

**Trust Meta-Classifier:** takes the face embedding, the primary prediction and its confidence, and learns when the primary model tends to be wrong. If its weights are missing, it runs in *cold-start* mode where every prediction defaults to `TRUSTED`.

---

## 📁 Repository Structure

```
Deepfake_realtime/
├── backend/                     # Backend service
├── frontend/                    # Web UI
├── models/                      # Model weights (best_model.pt, trust_meta.pt)
├── server/                      # FastAPI server + trust_model.py
├── Deepfake_Detection.ipynb     # Training notebook
├── extract_clear_faces.py       # Extract clean face crops from your own videos
├── process_custom_data.py       # Prepare custom data for fine-tuning
├── finetune_model.py            # Fine-tune the primary model on custom data
├── realtime_deepfake_detector.py# Real-time webcam / video detector
├── inspect_models.py            # Inspect saved model checkpoints
├── hf_upload.py                 # Upload model weights to Hugging Face
├── test_upload.py               # Test the upload flow
└── requirements.txt
```

---

## ⚙️ Installation

**Prerequisites:** Python 3.12, a webcam (optional), and an NVIDIA GPU with CUDA 12.x (optional but recommended).

```bash
# 1. Clone
git clone https://github.com/DeepArnav1102/Deepfake_realtime.git
cd Deepfake_realtime

# 2. Create a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. (GPU only) Install CUDA-enabled PyTorch
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
```

Place your trained weights in `models/`:

| File | Purpose |
|------|---------|
| `models/best_model.pt` | Primary deepfake classifier |
| `models/trust_meta.pt` | Trust Meta-Classifier (optional; cold-start if absent) |

> If `best_model.pt` is missing, the detector runs with random weights. Train or download the model first.

---

## 🚀 Usage

### Real-time detection

```bash
# Default webcam
python realtime_deepfake_detector.py

# Custom model paths
python realtime_deepfake_detector.py --model models/best_model.pt --trust-model models/trust_meta.pt

# A specific webcam or a video file
python realtime_deepfake_detector.py --source 1
python realtime_deepfake_detector.py --source video.mp4

# Stricter confidence threshold
python realtime_deepfake_detector.py --threshold 0.65
```

| Argument | Default | Description |
|----------|---------|-------------|
| `--model` | `models/best_model.pt` | Primary model weights |
| `--trust-model` | `models/trust_meta.pt` | Trust Meta-Classifier weights |
| `--source` | `0` | Webcam index or path to a video file |
| `--threshold` | `0.60` | Minimum confidence to show a prediction (0–1) |
| `--min-face-size` | `60` | Minimum face size in pixels for MTCNN |

**Keyboard controls**

| Key | Action |
|-----|--------|
| `Q` / `Esc` | Quit |
| `S` | Save a screenshot (`screenshot_0001.jpg`, …) |
| `T` | Cycle threshold: 0.50 → 0.60 → 0.65 → 0.75 |

**Reading the overlay**

| Colour | Meaning |
|--------|---------|
| 🟢 Green | `REAL` / `TRUSTED` |
| 🔴 Red | `FAKE` / `UNTRUSTED` |
| 🟠 Amber | `NEEDS_REVIEW` |
| ⚪ Grey | `UNKNOWN` (confidence below threshold) |

### Using it in a video call

1. Run the detector with your webcam as the source.
2. Keep the window beside Zoom / Meet / Teams, or capture it with **OBS** and expose it through **OBS Virtual Camera**.

---

## 🏋️ Training & Fine-Tuning

### 1. Train the base model
Open `Deepfake_Detection.ipynb` and run it. It was developed against the Kaggle **DFD (67k)** face dataset and saves the best checkpoint to `models/best_model.pt`.

### 2. Fine-tune on your own data

```bash
# a) Extract clear face crops from your videos
python extract_clear_faces.py

# b) (Optional) Process/organize the custom data
python process_custom_data.py

# c) Fine-tune
python finetune_model.py
```

Expected data layout:

```
my_data/
├── real/    # your real face crops
└── fake/    # your fake face crops (optional)
extracted_faces/train/
├── real/    # original dataset (small mix-in to prevent forgetting)
└── fake/
```

Fine-tuning details:
- Loads `models/best_model.pt`, **backs it up with a timestamp**, then overwrites it with the improved weights
- Unfreezes only the last backbone blocks (`block8`, `block7`, `last_linear`, `last_bn`, `logits`) plus the head
- Low learning rate (`3e-5`), AdamW, 8 epochs, mixed precision on CUDA
- Mixes in 500 fake + 200 real samples from the original dataset
- Logs the run to `models/finetune_log.txt`

Restart the server after fine-tuning so it picks up the new weights.

### 3. Inspect or publish weights

```bash
python inspect_models.py      # Inspect saved checkpoints
python hf_upload.py           # Upload weights to Hugging Face Hub
```

---

## 🧰 Tech Stack

| Area | Tools |
|------|-------|
| Deep learning | PyTorch, torchvision, facenet-pytorch (MTCNN, InceptionResnetV1), timm |
| Computer vision | OpenCV, Pillow |
| Data & training | NumPy, tqdm, matplotlib, seaborn, Jupyter, 🤗 Datasets, kagglehub |
| Serving | FastAPI (`server/`) |

---

## ⚠️ Limitations & Responsible Use

- Detection accuracy depends heavily on lighting, resolution, camera angle and compression. Video-call codecs can degrade results.
- The model reflects its training data and may not generalise to unseen generation methods.
- Results are probabilistic. Treat them as a **signal, not proof**, and don't use them as the sole basis for decisions about a person.
- Only run it on video you have the right to analyse.

---

## 🗺️ Roadmap

- [ ] Temporal smoothing across frames
- [ ] Audio-based deepfake detection
- [ ] Browser extension for in-call overlays
- [ ] Benchmark results on additional datasets

---

## 🤝 Contributing

Contributions are welcome. Fork the repo, create a feature branch, and open a pull request.

```bash
git checkout -b feature/your-feature
git commit -m "Add your feature"
git push origin feature/your-feature
```

---
