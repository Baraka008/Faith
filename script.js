const photos = [
  { src: "WhatsApp Image 2026-10-12 at 13.04.58.jpeg", alt: "Faith laughing at an outdoor gathering", caption: "Caught mid-giggle" },
  { src: "WhatsApp Image 2026-10-12 at 13.04.58 (1).jpeg", alt: "Faith smiling with a friend at an open-air event", caption: "Her and her people" },
  { src: "WhatsApp Image 2026-10-12 at 13.04.58 (2).jpeg", alt: "Faith sharing a smile outdoors", caption: "A little moment" },
  { src: "WhatsApp Image 2026-10-12 at 13.04.58 (3).jpeg", alt: "Faith standing with friends at an outdoor event", caption: "Always in good company" },
  { src: "WhatsApp Image 2026-10-12 at 13.04.58 (4).jpeg", alt: "Faith hanging out with friends in the sunshine", caption: "The whole scene" },
  { src: "WhatsApp Image 2026-10-12 at 13.04.58 (5).jpeg", alt: "Faith walking past event tents", caption: "Main-character walk" },
  { src: "WhatsApp Image 2026-10-12 at 13.05.39.jpeg", alt: "Faith chatting and smiling with her boyfriend by the garden", caption: "Garden-side giggles" },
  { src: "WhatsApp Image 2026-10-12 at 13.05.39 (1).jpeg", alt: "Faith and her boyfriend talking and laughing together", caption: "Just us being us" },
  { src: "WhatsApp Image 2026-10-12 at 13.05.39 (2).jpeg", alt: "Faith smiling with her boyfriend under the palm trees", caption: "That easy smile" },
  { src: "WhatsApp Image 2026-10-12 at 13.05.39 (3).jpeg", alt: "Faith enjoying a sunny moment at the event", caption: "Look at you" },
  { src: "WhatsApp Image 2026-10-12 at 13.05.39 (4).jpeg", alt: "Faith and her boyfriend sharing a sweet conversation", caption: "A favorite little moment" },
  { src: "WhatsApp Image 2026-10-12 at 13.05.39 (5).jpeg", alt: "Faith and her boyfriend seen from above in the garden", caption: "A different angle" }
];

const tracks = [
  { title: "Perfect", artist: "Ed Sheeran", src: "Ed Sheeran - Perfect (Official Music Video).mp3" },
  { title: "Perfect Design", artist: "Nyashinski", src: "Nyashinski - Perfect Design (Official Music Video).mp3" }
];
const trackStartSeconds = 30;

const photoGrid = document.querySelector("#photo-grid");
const photoDialog = document.querySelector("#photo-dialog");
const dialogImage = document.querySelector("#dialog-image");
const dialogCaption = document.querySelector("#dialog-caption");
const dialogCounter = document.querySelector("#dialog-counter");
const audio = document.querySelector("#audio-player");
const player = document.querySelector(".music-player");
const progress = document.querySelector("#player-progress");
const playerMessage = document.querySelector("#player-message");
let currentPhoto = 0;
let currentTrack = 0;
let currentTrackStarted = false;

function assetUrl(filename) {
  return `./${encodeURIComponent(filename).replaceAll("%2F", "/")}`;
}

photoGrid.innerHTML = photos.map((photo, index) => `
  <button class="photo-tile reveal" type="button" data-photo-index="${index}" aria-label="Open photo ${index + 1}: ${photo.alt}">
    <img src="${assetUrl(photo.src)}" alt="${photo.alt}" loading="lazy">
    <span class="photo-caption">${photo.caption}<span>${String(index + 1).padStart(2, "0")}</span></span>
  </button>
`).join("");

async function startPlayback() {
  if (!audio.paused) return;
  try {
    if (audio.readyState < HTMLMediaElement.HAVE_METADATA) {
      await new Promise((resolve, reject) => {
        const onMetadata = () => {
          audio.removeEventListener("error", onError);
          resolve();
        };
        const onError = () => {
          audio.removeEventListener("loadedmetadata", onMetadata);
          reject(audio.error);
        };
        audio.addEventListener("loadedmetadata", onMetadata, { once: true });
        audio.addEventListener("error", onError, { once: true });
      });
    }
    if (!currentTrackStarted) {
      audio.currentTime = Math.min(trackStartSeconds, Math.max(0, audio.duration - 0.5));
      currentTrackStarted = true;
    }
    await audio.play();
    playerMessage.textContent = "A LITTLE MUSIC, JUST FOR YOU";
  } catch {
    playerMessage.textContent = audio.error ? "THIS TRACK COULD NOT BE LOADED" : "HOVER OR TAP A PHOTO FOR THE MUSIC";
  }
  updatePlaybackUI();
}

function showPhoto(index) {
  currentPhoto = (index + photos.length) % photos.length;
  const photo = photos[currentPhoto];
  dialogImage.src = assetUrl(photo.src);
  dialogImage.alt = photo.alt;
  dialogCaption.textContent = photo.caption;
  dialogCounter.textContent = `${String(currentPhoto + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")}`;
}

photoGrid.addEventListener("click", (event) => {
  const tile = event.target.closest("[data-photo-index]");
  if (!tile) return;
  startPlayback();
  showPhoto(Number(tile.dataset.photoIndex));
  photoDialog.showModal();
});
photoGrid.addEventListener("pointerover", (event) => {
  const tile = event.target.closest("[data-photo-index]");
  if (event.pointerType === "mouse" && tile && !tile.contains(event.relatedTarget)) startPlayback();
});
document.querySelector(".hero-art").addEventListener("pointerenter", (event) => {
  if (event.pointerType === "mouse") startPlayback();
});

document.querySelector(".dialog-close").addEventListener("click", () => photoDialog.close());
document.querySelector(".dialog-prev").addEventListener("click", () => showPhoto(currentPhoto - 1));
document.querySelector(".dialog-next").addEventListener("click", () => showPhoto(currentPhoto + 1));
photoDialog.addEventListener("click", (event) => {
  if (event.target === photoDialog) photoDialog.close();
});
photoDialog.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") showPhoto(currentPhoto - 1);
  if (event.key === "ArrowRight") showPhoto(currentPhoto + 1);
});

function setTrack(index) {
  currentTrack = index;
  currentTrackStarted = false;
  audio.pause();
  const track = tracks[currentTrack];
  audio.src = assetUrl(track.src);
  audio.load();
  document.querySelector("#player-title").textContent = track.title;
  document.querySelector("#player-artist").textContent = `${track.artist} · for Faith`;
  document.querySelector("#player-current").textContent = "0:00";
  document.querySelector("#player-duration").textContent = "0:00";
  progress.value = "0";
  progress.style.setProperty("--progress", "0%");
  document.querySelectorAll("[data-track-choice]").forEach((button, buttonIndex) => {
    const isActive = buttonIndex === currentTrack;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  playerMessage.textContent = "HOVER OR TAP A PHOTO FOR THE MUSIC";
}

async function togglePlayback() {
  if (audio.paused) {
    await startPlayback();
  } else {
    audio.pause();
    playerMessage.textContent = "PAUSED, BUT STILL YOURS";
  }
  updatePlaybackUI();
}

function updatePlaybackUI() {
  const isPlaying = !audio.paused;
  player.classList.toggle("is-playing", isPlaying);
  document.querySelectorAll("[data-play-toggle]").forEach((button) => {
    const icon = button.querySelector(".player-icon");
    const label = isPlaying ? "Pause music" : "Play music";
    button.setAttribute("aria-label", label);
    if (icon) icon.textContent = isPlaying ? "Ⅱ" : "▶";
  });
  document.querySelectorAll(".button-play, .button-coral").forEach((button) => {
    const icon = button.querySelector(".play-triangle");
    if (icon) icon.textContent = isPlaying ? "Ⅱ" : "▶";
  });
}

document.querySelectorAll("[data-play-toggle]").forEach((button) => button.addEventListener("click", togglePlayback));
document.querySelectorAll("[data-track-choice]").forEach((button) => {
  button.addEventListener("click", async () => {
    const wasPlaying = !audio.paused;
    setTrack(Number(button.dataset.trackChoice));
      if (wasPlaying) await startPlayback();
    updatePlaybackUI();
  });
});

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

audio.addEventListener("loadedmetadata", () => {
  document.querySelector("#player-duration").textContent = formatTime(audio.duration);
});
audio.addEventListener("timeupdate", () => {
  document.querySelector("#player-current").textContent = formatTime(audio.currentTime);
  const percent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  progress.value = String(percent);
  progress.style.setProperty("--progress", `${percent}%`);
});
audio.addEventListener("ended", () => {
  if (currentTrack < tracks.length - 1) {
    setTrack(currentTrack + 1);
    startPlayback();
  } else {
    playerMessage.textContent = "THAT ONE WAS FOR YOU, FAITH";
    updatePlaybackUI();
  }
});
audio.addEventListener("error", () => {
  playerMessage.textContent = "THIS TRACK COULD NOT BE LOADED";
});
progress.addEventListener("input", () => {
  if (!Number.isFinite(audio.duration)) return;
  audio.currentTime = (Number(progress.value) / 100) * audio.duration;
  progress.style.setProperty("--progress", `${progress.value}%`);
});

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
setTrack(0);
startPlayback();