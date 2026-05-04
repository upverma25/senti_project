import os
import time
import re
import string
import joblib
import numpy as np
import nltk
from nltk.corpus import movie_reviews, stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import accuracy_score

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "sentiment_model.pkl")
NLTK_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "nltk_data")

POSITIVE_KEYWORDS = {
    "excellent", "amazing", "fantastic", "wonderful", "great", "superb", "love",
    "brilliant", "outstanding", "perfect", "beautiful", "incredible", "awesome",
    "happy", "pleased", "delighted", "impressed", "satisfied", "recommend",
    "best", "good", "nice", "helpful", "enjoyable", "positive",
}
NEGATIVE_KEYWORDS = {
    "terrible", "awful", "horrible", "dreadful", "disgusting", "hate", "worst",
    "poor", "bad", "disappointing", "useless", "broken", "failure", "wrong",
    "frustrating", "annoying", "angry", "upset", "dissatisfied", "regret",
    "waste", "avoid", "never", "problem", "issue", "complaint",
}


def download_nltk_data():
    os.makedirs(NLTK_DATA_PATH, exist_ok=True)
    nltk.data.path.insert(0, NLTK_DATA_PATH)
    for pkg in ["movie_reviews", "stopwords", "wordnet", "omw-1.4", "punkt"]:
        try:
            nltk.download(pkg, download_dir=NLTK_DATA_PATH, quiet=True)
        except Exception:
            pass


def preprocess(text: str) -> str:
    nltk.data.path.insert(0, NLTK_DATA_PATH)
    lemmatizer = WordNetLemmatizer()
    try:
        stop_words = set(stopwords.words("english"))
    except Exception:
        stop_words = set()

    text = text.lower()
    text = re.sub(r"http\S+|www\S+", "", text)
    text = text.translate(str.maketrans("", "", string.punctuation))
    text = re.sub(r"\s+", " ", text).strip()

    tokens = text.split()
    tokens = [lemmatizer.lemmatize(t) for t in tokens if t not in stop_words and len(t) > 1]
    return " ".join(tokens)


class SentimentModel:
    def __init__(self):
        self._pipeline = None
        self._trained = False
        self._accuracy = 0.0
        self._train_samples = 0

    def is_loaded(self) -> bool:
        return self._trained

    def load_or_train(self):
        if os.path.exists(MODEL_PATH):
            try:
                data = joblib.load(MODEL_PATH)
                self._pipeline = data["pipeline"]
                self._accuracy = data.get("accuracy", 0.0)
                self._train_samples = data.get("train_samples", 0)
                self._trained = True
                print(f"[Model] Loaded from {MODEL_PATH} (acc={self._accuracy:.3f})")
                return
            except Exception as e:
                print(f"[Model] Load failed: {e}, retraining...")

        self._train()

    def _train(self):
        print("[Model] Downloading NLTK data...")
        download_nltk_data()

        print("[Model] Loading movie_reviews corpus...")
        nltk.data.path.insert(0, NLTK_DATA_PATH)

        docs, labels = [], []
        for cat in movie_reviews.categories():
            for fid in movie_reviews.fileids(cat):
                raw = " ".join(movie_reviews.words(fid))
                docs.append(preprocess(raw))
                labels.append(cat)

        # Add neutral samples (mixed/factual sentences)
        neutral_samples = [
            "the movie was released in theaters",
            "the product costs twenty dollars",
            "the meeting is scheduled for tuesday",
            "the package was delivered on time",
            "the store opens at nine in the morning",
            "the report contains several charts and graphs",
            "the team consists of five members",
            "the document was submitted last week",
            "the camera has twelve megapixels",
            "the flight departs at six pm",
        ]
        for s in neutral_samples * 20:
            docs.append(preprocess(s))
            labels.append("neutral")

        X_train, X_test, y_train, y_test = train_test_split(
            docs, labels, test_size=0.15, random_state=42, stratify=labels
        )

        pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(
                max_features=50000,
                ngram_range=(1, 2),
                sublinear_tf=True,
                min_df=2,
            )),
            ("clf", CalibratedClassifierCV(LinearSVC(C=1.0, max_iter=2000), cv=3)),
        ])

        print("[Model] Training LinearSVC pipeline...")
        pipeline.fit(X_train, y_train)

        y_pred = pipeline.predict(X_test)
        self._accuracy = accuracy_score(y_test, y_pred)
        self._train_samples = len(X_train)

        self._pipeline = pipeline
        self._trained = True

        joblib.dump({
            "pipeline": pipeline,
            "accuracy": self._accuracy,
            "train_samples": self._train_samples,
        }, MODEL_PATH)
        print(f"[Model] Trained & saved. Accuracy={self._accuracy:.3f}, samples={self._train_samples}")

    def predict(self, text: str) -> dict:
        t0 = time.time()
        processed = preprocess(text)

        proba = self._pipeline.predict_proba([processed])[0]
        classes = list(self._pipeline.classes_)

        scores = {c: float(round(p, 4)) for c, p in zip(classes, proba)}
        sentiment = max(scores, key=scores.get)
        confidence = float(round(scores[sentiment], 4))

        # Normalise keys
        pos = scores.get("pos", scores.get("positive", 0.0))
        neg = scores.get("neg", scores.get("negative", 0.0))
        neu = scores.get("neutral", max(0.0, round(1 - pos - neg, 4)))

        # Remap sentiment label
        label_map = {"pos": "positive", "neg": "negative", "neutral": "neutral"}
        sentiment = label_map.get(sentiment, sentiment)

        key_phrases, phrase_sentiments = self._extract_phrases(text)
        elapsed = round((time.time() - t0) * 1000, 2)

        return {
            "sentiment": sentiment,
            "confidence": confidence,
            "scores": {"positive": pos, "negative": neg, "neutral": neu},
            "key_phrases": key_phrases,
            "phrase_sentiments": phrase_sentiments,
            "processing_time_ms": elapsed,
        }

    def _extract_phrases(self, text: str):
        words = re.findall(r"\b[a-zA-Z]{3,}\b", text.lower())
        phrases, sentiments = [], []
        seen = set()
        for w in words:
            if w in seen:
                continue
            seen.add(w)
            if w in POSITIVE_KEYWORDS:
                phrases.append(w)
                sentiments.append("positive")
            elif w in NEGATIVE_KEYWORDS:
                phrases.append(w)
                sentiments.append("negative")
            if len(phrases) >= 8:
                break
        return phrases, sentiments

    def get_info(self) -> dict:
        return {
            "model": "LinearSVC (CalibratedClassifierCV)",
            "vectorizer": "TF-IDF (50k features, bigrams)",
            "trained": self._trained,
            "accuracy": round(self._accuracy, 4),
            "train_samples": self._train_samples,
            "classes": ["positive", "negative", "neutral"],
        }
