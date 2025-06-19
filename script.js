let playlists = JSON.parse(localStorage.getItem("playlists")) || { Default: [] };
let currentPlaylist = localStorage.getItem("currentPlaylist") || "Default";
let showVideo = false;
let player;
let currentIndex = 0;

function saveData() {
  localStorage.setItem("playlists", JSON.stringify(playlists));
  localStorage.setItem("currentPlaylist", currentPlaylist);
}

function extractVideoId(url) {
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
  return match ? match[1] : null;
}

function renderLibrary(filterTag = null) {
  const library = document.getElementById("library");
  library.innerHTML = "";
  const songs = playlists[currentPlaylist];
  const tagsSet = new Set();

  songs.forEach((song, index) => {
    song.tags.forEach(tag => tagsSet.add(tag));

    if (filterTag && !song.tags.includes(filterTag)) return;

    const card = document.createElement("div");
    card.className = "song-card";
    card.innerHTML = `
      <img src="https://img.youtube.com/vi/${song.videoId}/hqdefault.jpg" />
      <div class="song-title" contenteditable onblur="editTitle(${index}, this.innerText)">
        ${song.title}
      </div>
      <div class="tag-list">${song.tags.join(', ')}</div>
      <div class="controls">
        <button onclick="playVideo(${index})">▶️</button>
        <button onclick="removeVideo(${index})">🗑</button>
      </div>
    `;
    library.appendChild(card);
  });

  renderTagButtons([...tagsSet]);
}

function renderTagButtons(tags) {
  const tagFilter = document.getElementById("tag-filter");
  tagFilter.innerHTML = "";
  tags.forEach(tag => {
    const btn = document.createElement("button");
    btn.className = "tag-button";
    btn.innerText = tag;
    btn.onclick = () => renderLibrary(tag);
    tagFilter.appendChild(btn);
  });

  if (tags.length > 0) {
    const clear = document.createElement("button");
    clear.className = "tag-button";
    clear.innerText = "🧹全表示";
    clear.onclick = () => renderLibrary();
    tagFilter.appendChild(clear);
  }
}

function renderPlaylistSelector() {
  const select = document.getElementById("playlist-select");
  select.innerHTML = "";
  for (let name in playlists) {
    const option = document.createElement("option");
    option.value = name;
    option.innerText = name;
    if (name === currentPlaylist) option.selected = true;
    select.appendChild(option);
  }
  select.onchange = () => {
    currentPlaylist = select.value;
    saveData();
    renderLibrary();
  };
}

function editTitle(index, newTitle) {
  playlists[currentPlaylist][index].title = newTitle.trim();
  saveData();
}

function playVideo(index) {
  currentIndex = index;
  player.loadVideoById(playlists[currentPlaylist][index].videoId);
}

function nextVideo() {
  currentIndex = (currentIndex + 1) % playlists[currentPlaylist].length;
  playVideo(currentIndex);
}

function prevVideo() {
  currentIndex = (currentIndex - 1 + playlists[currentPlaylist].length) % playlists[currentPlaylist].length;
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

function removeVideo(index) {
  playlists[currentPlaylist].splice(index, 1);
  saveData();
  renderLibrary();
}

function toggleVideoMode() {
  showVideo = !showVideo;
  document.getElementById("player-container").style.display = showVideo ? "block" : "none";
}

function createPlaylist() {
  const name = prompt("新しいプレイリスト名は？");
  if (name && !playlists[name]) {
    playlists[name] = [];
    currentPlaylist = name;
    saveData();
    renderPlaylistSelector();
    renderLibrary();
  }
}

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "360",
    width: "640",
    videoId: playlists[currentPlaylist][0]?.videoId || "",
    events: {
      onStateChange: (event) => {
        if (event.data === YT.PlayerState.ENDED) nextVideo();
      }
    }
  });
}

document.getElementById("add-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const url = document.getElementById("youtube-url").value;
  const title = document.getElementById("custom-title").value || "無題";
  const tags = document.getElementById("custom-tags").value.split(",").map(tag => tag.trim()).filter(Boolean);
  const videoId = extractVideoId(url);
  if (!videoId) return alert("無効なYouTube URL");

  playlists[currentPlaylist].push({ title, videoId, tags });
  saveData();
  renderLibrary();
  e.target.reset();
});

window.onload = () => {
  renderPlaylistSelector();
  renderLibrary();
};

