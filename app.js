const jokeElement = document.querySelector("#joke");
const counterElement = document.querySelector("#counter");
const anotherButton = document.querySelector("#another");
const copyButton = document.querySelector("#copy");
const shareButton = document.querySelector("#share");
const toastElement = document.querySelector("#toast");

const STORAGE_KEY = "closing-remarks-joke-deck";
let currentJoke = "";
let toastTimer;

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function readDeck() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.remaining) && Number.isInteger(saved.seen)) {
      return saved;
    }
  } catch (_) {
    // A fresh deck is a perfectly good fallback when storage is unavailable.
  }
  return { remaining: shuffle(REAL_ESTATE_JOKES), seen: 0 };
}

function writeDeck(deck) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(deck)); } catch (_) {}
}

function nextJoke() {
  const deck = readDeck();
  if (deck.remaining.length === 0) {
    deck.remaining = shuffle(REAL_ESTATE_JOKES);
    deck.seen = 0;
  }

  currentJoke = deck.remaining.pop();
  deck.seen += 1;
  writeDeck(deck);

  jokeElement.animate(
    [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "translateY(0)" }],
    { duration: 260, easing: "ease-out" }
  );
  jokeElement.textContent = currentJoke;
  counterElement.textContent = `Joke ${deck.seen} of ${REAL_ESTATE_JOKES.length} before repeats`;
}

function showToast(message) {
  clearTimeout(toastTimer);
  toastElement.textContent = message;
  toastElement.classList.add("show");
  toastTimer = setTimeout(() => toastElement.classList.remove("show"), 1800);
}

async function copyJoke() {
  try {
    await navigator.clipboard.writeText(currentJoke);
    showToast("Joke copied—consider yourself disclosed.");
  } catch (_) {
    showToast("Couldn’t copy that one.");
  }
}

async function shareJoke() {
  if (navigator.share) {
    try {
      await navigator.share({ title: "Closing Remarks", text: currentJoke, url: location.href });
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }
  await copyJoke();
}

anotherButton.addEventListener("click", nextJoke);
copyButton.addEventListener("click", copyJoke);
shareButton.addEventListener("click", shareJoke);
nextJoke();
