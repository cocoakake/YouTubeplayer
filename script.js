let songs = JSON.parse(localStorage.getItem("songs")) || [];
let player;
let currentIndex = 0;

function extractVideoId(url) {
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
  return match ? match[1] : null;
}

function saveSongs() {
  localStorage.setItem("songs", JSON.stringify(songs));
}

function renderLibrary() {
  const library = document.getElementById("library");
  library.innerHTML = "";
  songs.forEach((song, i) => {
    const card = document.createElement("div");
    card.className = "song-card";
    card.innerHTML = `
      <img src="https://img.youtube.com/vi/${song.videoId}/hqdefault.jpg" />
      <div class="song-title" contenteditable onblur="editTitle(${i}, this.innerText)">${song.title}</div>
      <div class="controls">
        <button onclick="playVideo(${i})">▶️再生</button>
        <button onclick="removeVideo(${i})">🗑削除</button>
      </div>
    `;
    library.appendChild(card);
  });
}

function editTitle(i, newTitle) {
  songs[i].title = newTitle.trim();
  saveSongs();
}

function playVideo(i) {
  currentIndex = i;
  player.loadVideoById(songs[i].videoId);
}

function nextVideo() {
  currentIndex = (currentIndex + 1) % songs.length;
  playVideo(currentIndex);
}

function prevVideo() {
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  playVideo(currentIndex);
}

function togglePlay() {
  const state = player.getPlayerState();
  if (state === YT.PlayerState.PLAYING) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}

function removeVideo(i) {
  songs.splice(i, 1);
  saveSongs();
  renderLibrary();
}

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "0",
    width: "0",
    videoId: songs[0]?.videoId || "",
    events: {
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.ENDED) nextVideo();
      }
    }
  });
}

document.getElementById("add-form").addEventListener("submit", e => {
  e.preventDefault();
  const url = document.getElementById("youtube-url").value;
  const title = document.getElementById("custom-title").value || "無題";
  const videoId = extractVideoId(url);
  if (!videoId) {
    alert("無効なYouTube URLです");
    return;
  }
  songs.push({ title, videoId });
  saveSongs();
  renderLibrary();
  e.target.reset();
});

window.onload = () => {
  renderLibrary();
};
