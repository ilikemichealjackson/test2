const pageContent = document.getElementById('pageContent');

const pages = {
    home: `
        <h1>Welcome to frevr unrlsd</h1>
        <p>Discover new music and enjoy your favorite tracks.</p>
    `,
    search: `
        <h1>Search</h1>
        <input type="text" id="searchInput" class="stylized-input" placeholder="Search for songs, artists, or albums">
        <button id="searchButton" class="stylized-button">Search</button>
        <div id="searchResults"></div>
    `,
    library: `
        <h1>Your Library</h1>
        <div id="playlistContainer"></div>
    `,
    liked: `
        <h1>Liked Songs</h1>
        <div id="likedSongsContainer"></div>
    `,
    playlists: `
        <h1>Your Playlists</h1>
        <div id="userPlaylistsContainer"></div>
        <button id="createPlaylistBtn" class="stylized-button">Create New Playlist</button>
    `
};

let likedSongs = JSON.parse(localStorage.getItem('likedSongs')) || [];
let userPlaylists = JSON.parse(localStorage.getItem('userPlaylists')) || [];

function renderPage(pageName) {
    pageContent.innerHTML = pages[pageName];
    if (pageName === 'library') {
        renderLibrary();
    } else if (pageName === 'liked') {
        renderLikedSongs();
    } else if (pageName === 'playlists') {
        renderUserPlaylists();
    } else if (pageName === 'search') {
        setupSearch();
    }
}

function renderLibrary() {
    const playlistContainer = document.getElementById('playlistContainer');
    playlistContainer.innerHTML = '';
    userPlaylists.forEach(playlist => {
        const playlistElement = document.createElement('div');
        playlistElement.classList.add('playlist-item');
        playlistElement.innerHTML = `
            <img src="${playlist.cover || 'https://picsum.photos/50'}" alt="${playlist.name}">
            <span>${playlist.name}</span>
        `;
        playlistElement.addEventListener('click', () => viewPlaylist(playlist));
        playlistContainer.appendChild(playlistElement);
    });
}

function renderLikedSongs() {
    const likedSongsContainer = document.getElementById('likedSongsContainer');
    likedSongsContainer.innerHTML = '';
    likedSongs.forEach(song => {
        const songElement = document.createElement('div');
        songElement.classList.add('playlist-item');
        songElement.innerHTML = `
            <img src="${song.cover}" alt="${song.title}">
            <span>${song.title} - ${song.artist}</span>
        `;
        songElement.addEventListener('click', () => playSong(song));
        likedSongsContainer.appendChild(songElement);
    });
}

function renderUserPlaylists() {
    const userPlaylistsContainer = document.getElementById('userPlaylistsContainer');
    userPlaylistsContainer.innerHTML = '';
    userPlaylists.forEach(playlist => {
        const playlistElement = document.createElement('div');
        playlistElement.classList.add('playlist-item');
        playlistElement.innerHTML = `
            <img src="${playlist.cover || 'https://picsum.photos/50'}" alt="${playlist.name}">
            <span>${playlist.name}</span>
            <button class="remove-btn">Remove</button>
        `;
        playlistElement.querySelector('.remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            removePlaylist(playlist.id);
        });
        playlistElement.addEventListener('click', () => viewPlaylist(playlist));
        userPlaylistsContainer.appendChild(playlistElement);
    });

    const createPlaylistBtn = document.getElementById('createPlaylistBtn');
    createPlaylistBtn.addEventListener('click', createNewPlaylist);
}

function viewPlaylist(playlist) {
    pageContent.innerHTML = `
        <h1>${playlist.name}</h1>
        <div id="playlistSongs"></div>
    `;
    const playlistSongs = document.getElementById('playlistSongs');
    playlist.songs.forEach(song => {
        const songElement = document.createElement('div');
        songElement.classList.add('playlist-item');
        songElement.innerHTML = `
            <img src="${song.cover}" alt="${song.title}">
            <span>${song.title} - ${song.artist}</span>
            <button class="remove-btn">Remove</button>
        `;
        songElement.querySelector('.remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            removeSongFromPlaylist(playlist.id, song.id);
        });
        songElement.addEventListener('click', () => playSong(song));
        playlistSongs.appendChild(songElement);
    });
}

function createNewPlaylist() {
    showModal('Create New Playlist', `
        <input type="text" id="playlistName" class="stylized-input" placeholder="Playlist Name">
        <input type="text" id="playlistCover" class="stylized-input" placeholder="Cover Image URL (optional)">
    `, () => {
        const playlistName = document.getElementById('playlistName').value;
        const playlistCover = document.getElementById('playlistCover').value;
        if (playlistName) {
            const newPlaylist = {
                id: Date.now(),
                name: playlistName,
                cover: playlistCover || null,
                songs: []
            };
            userPlaylists.push(newPlaylist);
            saveUserPlaylists();
            renderUserPlaylists();
            updatePlaylistDropdown();
        }
    });
}

function addToLikedSongs(song) {
    if (!likedSongs.some(s => s.id === song.id)) {
        likedSongs.push(song);
        saveLikedSongs();
    }
}

function saveLikedSongs() {
    localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
}

function saveUserPlaylists() {
    localStorage.setItem('userPlaylists', JSON.stringify(userPlaylists));
}

function removePlaylist(playlistId) {
    userPlaylists = userPlaylists.filter(playlist => playlist.id !== playlistId);
    saveUserPlaylists();
    renderUserPlaylists();
    updatePlaylistDropdown();
}

function removeSongFromPlaylist(playlistId, songId) {
    