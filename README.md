# Sentiment Intelligence Platform

A production-ready, real-time sentiment analysis platform built with React + Vite + TailwindCSS on the frontend and FastAPI + LinearSVC NLP pipeline on the backend. Deploys as a single project on Vercel.

---

## Architecture

```
sentiment-intelligence/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI app, CORS, routes
│   │   └── model.py         # LinearSVC training, inference, phrase extraction
│   ├── index.py             # Vercel serverless entry point
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, TextInput, ResultCard, History, Chart
│   │   ├── hooks/           # useSentiment state hook
│   │   ├── lib/             # axios API client + types
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
├── vercel.json              # Monorepo build + routing config
└── .gitignore
```

## Technology Stack

| Component    | Technology                          |
|--------------|-------------------------------------|
| Frontend     | React 18, Vite, TypeScript, TailwindCSS |
| Charts       | Chart.js, react-chartjs-2           |
| Backend      | Python 3.11, FastAPI, Uvicorn       |
| ML / NLP     | Scikit-learn, NLTK, Pandas, NumPy   |
| Model        | LinearSVC (CalibratedClassifierCV)  |
| Vectorizer   | TF-IDF (50k features, bigrams)      |
| Deployment   | Vercel (serverless Python + static) |

---

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The first run downloads NLTK data and trains the model (~30s). Subsequent runs load from `sentiment_model.pkl`.

API available at `http://localhost:8000`
- `GET  /health`          — health + model status
- `POST /api/predict`     — run sentiment inference
- `GET  /api/model-info`  — model metadata

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend available at `http://localhost:5173`. The Vite proxy forwards `/api` to `localhost:8000`.

---

## Deploy to Vercel

### One-command deploy

```bash
npm install -g vercel
vercel --prod
```

Vercel auto-detects the `vercel.json` and builds both the Python backend (serverless function) and the React frontend (static site).

### Manual steps

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Leave all settings as default — `vercel.json` handles everything
4. Click **Deploy**

> **Note:** The first cold-start request trains the model and downloads NLTK data. This takes ~40–60s on Vercel's serverless runtime. Subsequent requests use the cached pkl file (fast, ~50ms).

### Environment variables (optional)

Set in the Vercel dashboard → Project → Settings → Environment Variables:

| Variable       | Default  | Description                    |
|----------------|----------|--------------------------------|
| `VITE_API_URL` | `/api`   | Backend API base URL           |

---

## API Reference

### `POST /api/predict`

**Request:**
```json
{ "text": "This product is absolutely fantastic!" }
```

**Response:**
```json
{
  "sentiment": "positive",
  "confidence": 0.94,
  "scores": {
    "positive": 0.94,
    "negative": 0.03,
    "neutral": 0.03
  },
  "key_phrases": ["fantastic"],
  "phrase_sentiments": ["positive"],
  "processing_time_ms": 42.5
}
```

---

## ML Pipeline

1. **Dataset:** NLTK `movie_reviews` corpus (~2,000 labeled docs)
2. **Preprocessing:** lowercase → URL strip → punctuation removal → stopword removal → lemmatization
3. **Feature extraction:** TF-IDF (unigrams + bigrams, 50k features, sublinear TF)
4. **Model:** `LinearSVC` wrapped in `CalibratedClassifierCV` for probability output
5. **Serialization:** `joblib.dump` → `sentiment_model.pkl`
6. **Inference:** Singleton model loaded once per process → ~50ms per prediction

---

## License

MIT — built by Shreyansh Pratap Mishra
