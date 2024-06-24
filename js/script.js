let currentSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
    // Handle negative input by taking the absolute value
    seconds = Math.abs(seconds);

    // Round the seconds to the nearest integer
    const roundedSeconds = Math.round(seconds);

    // Get the integer part of the minutes
    const minutes = Math.floor(roundedSeconds / 60);

    // Get the remaining seconds
    const remainingSeconds = roundedSeconds % 60;

    // Format minutes and seconds to always be two digits
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    // Return the formatted time in mm:ss format
    return `${formattedMinutes}:${formattedSeconds}`;
}

//if you're viewing this code for the first time, then start from here
async function getSongs(folder) {
    currFolder = folder;
    //fetching the songs from the local directory
    // console.log(folder)
    data = await fetch(`http://127.0.0.1:3000/${folder}/`);
    response = await data.text();

    ele = document.createElement("div");
    ele.innerHTML = response;

    songs = ele.getElementsByTagName("a");
    songsArray = [];

    //pushing all the songs inside array
    for (let index = 0; index < songs.length; index++) {
        const element = songs[index];
        if (element.href.endsWith(".mp3")) {
            const fullUrl = new URL(element.getAttribute('href'), data.url);
            songsArray.push(fullUrl.href.split(`${folder}/`)[1]);
        }
    }

        //displaying the songs in the playlist
        let parent = document.querySelector(".songList ul");
        parent.innerHTML = "";
        for (const song of songsArray) {
            parent.innerHTML = parent.innerHTML + `
                            <li>
                                <img class="invert" src="img/music.svg">
                                <div class="info">
                                    <div>${decodeURI(song)}</div>
                                    <div class="artist">Song artist</div>
                                </div>
                                <img src="img/playbtn.svg" alt="">
                            </li>`
        }
    
    
        //Attach an eventlistner to each song present in the library
        Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e) => {
            e.addEventListener("click", element => {
                // console.log(e.querySelector(".info").firstElementChild.innerHTML);
                playMusic(e.querySelector(".info").firstElementChild.innerHTML);
            })
        });

    }

const playMusic = (song, pause = false) => {
    currentSong.src = `${currFolder}/` + song;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    play.classList.add("pause");
    document.querySelector(".songinfo").innerHTML = decodeURI(song);
    document.querySelector(".songtime").innerHTML = `00:00 / 00:00`;
}

async function displayAlbums(){
    cardContainer = document.querySelector(".cardContainer");

    data = await fetch(`http://127.0.0.1:3000/songs/`);
    response = await data.text();

    ele = document.createElement("div");
    ele.innerHTML = response;
    album = ele.getElementsByTagName("a");
    for (const i of album) {
        if(i.href.includes("/songs")){
            folder = i.href.split("/").slice(-2)[0];

            //get the metadata of the folder
            data = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            response = await data.json();

            // console.log(response); 
            cardContainer.innerHTML = cardContainer.innerHTML + `

                    <div data-folder="${response.folderName}" class="card">

                        <div class="play">

                            <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="25" cy="25" r="25" fill="#1ed760" />
                                <path
                                    d="M19.05 16.606l13.49 7.788a.7.7 0 0 1 0 1.212l-13.49 7.788a.7.7 0 0 1-1.05-.606V17.212a.7.7 0 0 1 1.05-.606z"
                                    fill="black" />
                            </svg>
                        </div>

                        <img src="/songs/${folder}/cover.jfif" alt="" >
                        <h3 >${response.title}</h3>
                        <p >${response.description}</p>
                    </div>`
        }    
        
    //load the playlist whenever card is clicked                        
    document.querySelectorAll(".card").forEach((card)=>{
        card.addEventListener("click", async item=>{
            // console.log(item.currentTarget.dataset);
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);    
            playMusic(songsArray[0]);
        })
    })
    }
}

async function main() {
    await getSongs("songs/Arijit");

    playMusic(songsArray[0], true);

    //display all the albums on the page
    displayAlbums()

    //Attach an eventListener to play btns
    let prev = document.getElementById("prev");
    let play = document.getElementById("play");
    let next = document.getElementById("next");

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
            play.classList.add("pause");
        } else {
            currentSong.pause();
            play.src = "img/playbtn.svg";
            play.classList.remove("pause");
        }
    })

    //Listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime , currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${isNaN(currentSong.currentTime) ? "00:00" : formatTime(currentSong.currentTime)} / ${isNaN(currentSong.duration) ? "00:00" : formatTime(currentSong.duration)}`;

        //for movement of seekbar
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = e.offsetX / e.target.getBoundingClientRect().width * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })


    //adding class to div.arrows
    const myElement = document.querySelector(".nav-arrow");
    const mediaQuery = window.matchMedia('(max-width: 1100px)');

    if (mediaQuery.matches) {
        // Add the class when the max-width is 1100px or less
        myElement.classList.add('arrows');
    } else {
        // Remove the class when the width is greater than 1100px
        myElement.classList.remove('arrows');
    }

    //adding functionality to the humburger icon
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "0%" 
    })

    //adding functionality to the cross icon 
    document.querySelector(".cross").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "-100%" 
    })

    //add an event listener to prev and next
    prev = document.querySelector("#prev");
    next = document.querySelector("#next");

    prev.addEventListener("click",()=>{
        search = currentSong.src.split("/").slice(-1)[0];
        index = songsArray.indexOf(search);
        if((index-1)>=0){
            playMusic(songsArray[index-1]);
        }
    })

    next.addEventListener("click",()=>{
        search = currentSong.src.split("/").slice(-1)[0];
        index = songsArray.indexOf(search);
        if((index+1) < songsArray.length){
            playMusic(songsArray[index+1]);
        }
        // console.log(`length: ${songs.length}`);
    })

    //add an event listener to volume button
    document.querySelector("#vol").addEventListener("change",(e)=>{
        currentSong.volume = parseInt(e.currentTarget.value) / 100;
    })

    //add event listener to mute the song
    document.querySelector(".vol").addEventListener("click", (e)=>{
        // console.log(e.target.src)
        if(e.target.src.endsWith("volume.svg")){
        e.target.src="img/mute.svg";
        currentSong.volume = 0;
        document.querySelector("#vol").value = 0;
        // console.log(e.target.src)
    }else{
        e.target.src="img/volume.svg";
        currentSong.volume = 1;
        document.querySelector("#vol").value = 100
    }
    })

}

main();