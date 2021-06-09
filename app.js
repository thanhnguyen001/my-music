/**
 * 1. Render songs
 * 2. Scroll top
 * 3. Play/ Pause/ seek
 * 4. CD rotate
 * 5. Next / prev
 * 6. random
 * 7. Next / repeat song when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
 */
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);


const PLAYER_STORAGE_KEY = 'My-music';
const cdThumb = $('.cd-thumb');
const heading = $('header h4');
const currentSongName = $('header h2');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress')
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');

const app = {
    currentIndexSong: 0,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function(key, value){
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    songs: [
        {
            name: 'This City',
            singer: 'Sam Fischer',
            path:'./Music/songs/ Fischer  This City Official Video.mp3',
            img: './Music/imgs/SamFischer.jpg'
        },
        {
            name: 'Something',
            singer: 'Kang Daniel',
            path:'./Music/songs/Something.mp3',
            img: './Music/imgs/something.jpg'
        },
        {
            name: 'Fight the bad feeling',
            singer: 'T-Max',
            path:'./Music/songs/Fight The Bad Feeling - TMax Boys Over Flowers OST.mp3',
            img: './Music/imgs/T-Max.jpg'
        },
        {
            name: 'Here I Am',
            singer: 'Jo Hyun Ah',
            path:'./Music/songs/Here I Am.mp3',
            img: './Music/imgs/hereI-am.jpg'
        },
        {
            name: 'Nắm bàn tay say cả đời',
            singer: 'ĐẠT TRẦN x NÂU ft. Elbi',
            path:'./Music/songs/Nắm bàn tay say cả đời  ĐẠT TRẦN x N U ft Elbi.mp3',
            img: './Music/imgs/YEAH1.jpg'
        },
    ],
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    render: function() {
        const htmls = this.songs.map((song, index) => {   
            return `
            <div class="song" data-index="${index}">
            <div class="thumb" style="background-image: url('${song.img}')">
            </div>
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>`
        });
        $('.playlist').innerHTML = htmls.join('');
    },
    definedProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
               return this.songs[this.currentIndexSong];
            }
        })
    },
    handleEvents: function () {

        // console.log(songBtns);

        const _this = this;
        const cdWidth = $('.cd').offsetWidth;
        // Xử lý cd quay
        const cdRotate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000, // 10 seconds
            iterations: Infinity
        })
        cdRotate.pause();       

        // Xử lý khi cuộn danh sách songs
        $('.playlist').onscroll = function () {
            const scrollTop = this.scrollTop;
            const newWidth = cdWidth - scrollTop;
            $('.cd').style.width = newWidth > 0 ? newWidth + 'px': 0 ;
            $('.cd').style.opacity = newWidth / cdWidth;
        }
        playBtn.onclick = function() {
            _this.isPlaying = !_this.isPlaying;
            if (_this.isPlaying) {
                _this.playSong();
                cdRotate.play();
            }
            else {
                audio.pause();
                player.classList.remove('playing');
                cdRotate.pause();
            }
        }
        // Khi tiến độ bài hát thay đổi theo thời gian
        audio.ontimeupdate = function() {
            if (audio.duration){
                const progressPercent = Math.floor(audio.currentTime * 100 / audio.duration);
                progress.value = progressPercent;
            }
            // if (progress.value == 100 && !_this.isRepeat) {
            //     _this.nextSong();
            //     progress.value = 0;
            //     cdRotate.play();
            //     _this.playSong();
            // }
        }
        // khi tua
        progress.onchange = function (e) {
            const seekTime = audio.duration * e.target.value / 100;
            audio.currentTime = seekTime;
            if (e.target.value == 100 && !_this.isRepeat) {
                _this.nextSong();
                e.target.value = 0;
            }
            cdRotate.play();
            _this.playSong();
        }
        // Khi next
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            }
            else {
                _this.nextSong();
            }
            progress.value = 0;
            cdRotate.play();
            _this.playSong(); 
        };

        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong();
            }
            else {              
                _this.prevSong();
            }
            progress.value = 0;
            cdRotate.play();
            _this.playSong();
        }
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);

        }
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;     
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }
        audio.onended = function () {
            if(_this.isRepeat) {
                _this.playSong();
            }
            else nextBtn.onclick();
        }

        // Bấm vào dom playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)');
            if (songNode || e.target.closest('.option')) {
                if (songNode) {
                    const songWasActive = playlist.querySelector('.song.active') 
                    if (songWasActive) {
                        songWasActive.classList.remove('active')
                    } 
                    _this.currentIndexSong = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.playSong();
                }
                if (e.target.closest('.option')) {
                    console.log(e.target)
                }
            }   
        }
        // const songBtns = $$('.song');

            // Bấm trực tiếp vào element song/ nhưng có vấn đề nếu update bài hat sau thì k bấm đc

        // songBtns.forEach((song, index) => {
        //     song.onclick = function() {   
        //         const songWasActive = playlist.querySelector('.song.active') 
        //         if (songWasActive) {
        //             songWasActive.classList.remove('active')
        //         }                            
        //         song.classList.add('active');
        //         _this.choseSong(index);
        //         cdRotate.play();
        //     }
        // })

    },
    // getCurrentSong: function() {
    //     return this.songs[this.currentIndexSong];
    // },
    nextSong: function() { 
        // if (this.currentIndexSong < this.songs.length) {
        //     ++this.currentIndexSong;
        // } else {
        //     this.currentIndexSong -= this.songs.length;
        // }
        ++this.currentIndexSong;
        if (this.currentIndexSong >= this.songs.length) {
            this.currentIndexSong -= this.currentIndexSong;
        }
        const songBtns = $$('.song');
        songBtns.forEach((song, index) => {           
            const songWasActive = playlist.querySelector('.song.active') 
            if (songWasActive) {
                songWasActive.classList.remove('active')
            }        
            if (index === this.currentIndexSong) {
                song.classList.add('active');
            }
               
        })
        this.loadCurrentSong();
    },
    prevSong: function() {
        if (this.currentIndexSong > 0) {
            --this.currentIndexSong;
        }
        else {
            this.currentIndexSong += this.songs.length - 1;
        }
        const songBtns = $$('.song');
        songBtns.forEach((song, index) => {           
            const songWasActive = playlist.querySelector('.song.active') 
            if (songWasActive) {
                songWasActive.classList.remove('active')
            }        
            if (index === this.currentIndexSong) {
                song.classList.add('active');
            }
               
        })
        this.loadCurrentSong();
    },
    playRandomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndexSong)
       
        this.currentIndexSong -= this.currentIndexSong - newIndex ;     
        const songBtns = $$('.song');
        songBtns.forEach((song, index) => {           
            const songWasActive = playlist.querySelector('.song.active') 
            if (songWasActive) {
                songWasActive.classList.remove('active')
            }        
            if (index === this.currentIndexSong) {
                song.classList.add('active');
            }
               
        })
        this.loadCurrentSong();
    },
    playSong: function() {
        audio.play();
        player.classList.add('playing');

    },
    loadCurrentSong: function() {
        currentSongName.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.img}')`;
        audio.src = this.currentSong.path;
        const currentIndex = this.currentIndexSong;
        const _this = this;
        const songBtns = $$('.song');
        songBtns.forEach((song, index) => {             
            if (index == currentIndex) {
                song.classList.add('active');
            }               
        })
        this.scrollIntoView();

    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
        
    },
    choseSong: function(index) {
        this.currentIndexSong -= this.currentIndexSong - index;
        this.loadCurrentSong();
        this.playSong();


    },
    scrollIntoView: function() {
        setTimeout( ()=>{
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
        }
        , 300)
    },
    start: function() {
        this.definedProperties();

        this.render();

        this.loadConfig();
        // this.getCurrentSong();
        // console.log(this.getCurrentSong());

        this.handleEvents();

        this.loadCurrentSong();
        repeatBtn.classList.toggle('active', this.isRepeat)
        randomBtn.classList.toggle('active', this.isRandom);
    }
}

app.start()






