import './lib/webaudio-controls.js';

const template = document.createElement("template");
template.innerHTML = `
    <style>
    h2,h1{
        text-align: center;
    }
    .centerRule {
        display:flex; 
        flex-direction: column;
        margin: 0 auto 2em auto;
    }
    
    .canvasStyle {
        border-radius: 30px; 
        background: black;
    }
    
    .inlineStyle {
        flex-direction: row;
    }
    
    .currentTimeStyle {
        font-size: 25px;
        font-style: italic;
        color: white;
        margin-left: 30%;
   }
    
    #playButton {
        padding: 15px 25px; 
        width: 120px;
        font-size: 24px;
        text-align: center;
        cursor: pointer;
        outline: none;
        color: #fff;
        font-weight: bold;
        background-color: darkolivegreen;
        border: none;
        border-radius: 15px;
        float:left;
        margin-top: 40px
    }

    #playButton:active {
        box-shadow: 0 5px #666;
        transform: translateY(4px);
    }
    
    #screenDisplayer {
        position: relative;
        display: inline-block; 
        margin: 20px 40% 20px 40%; 
    }
    
    #screenDisplayer #textOnScreen {
        position: absolute;
        margin: 0 auto;
        left: 0;
        right: 0;
        top: 10%; 
        width: 85%;
        color: bisque;
        font-size: 20px;
        font-weight: bold;
        font-style: italic;
    }
    
    #textOnScreen > p {
        margin-top: 0;
        margin-bottom: 0;
    }
    
    .textOnScreenRight {
        text-align: right;
    }
    
    #buttonGroup {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        text-align: center;
        width:80%;
        margin: 20px auto
    }
    
    .buttonTitle {
        font-size: 20px;
    }
    
    #onOffImg {
        width: 50px; 
        height: 50px;
    }
    
    .canvasCurrentTime {
        position: absolute;
        left: 0;
        z-index: 999;
        width: 100%;
        height: 100%;
    }
    
    </style>
    <div class="centerRule">
        <h1 id="songTitle"></h1>
        <div style="position:relative;display: inline-block;" id="graphSong" class="centerRule">
            <img height="200em" src="./assets/imgs/redhotChilipeppers-Californication-Waveform.png">
            <canvas height="200em" class="canvasCurrentTime" id="rectCurrentTimeCanvas"></canvas>
        </div>
        <canvas id="audioVisual" class="canvasStyle"  height="500em" width="1000em"></canvas>
        <audio id="myPlayer" src="./assets/song/RedHotChiliPeppers-Californication.mp3" type="audio/mp3" crossorigin="anonymous"></audio>
        <br>
        <div id="mixTable">
            <img id="onOffImg" src="./assets/imgs/pauseState.png" alt="onOffImage">
            <h2> Mix table</h2>
            <div id="screenDisplayer">
                <img id="volumeScreen" src="./assets/imgs/screen.png">
                <div id="textOnScreen">
                    <p id="volumeOnScreen">Volume : 1</p>
                    <p id="frequencyOnScreen" class="textOnScreenRight"> Frequency : 350 Hz</span></p>
                    <p id="leftOnScreen">Left : 1</p>
                    <p id="qOnScreen" class="textOnScreenRight">Q : 0 dB</span></p>
                    <p id="rightOnScreen">Right : 1</p>
                    <p id="gainOnScreen" class="textOnScreenRight">Gain : 0</p>
                    <p id="currentTimeDisplayer" class="currentTimeStyle" style="margin-top: 10%"></p>
                </div>
            </div>
            <button id="playButton">Play</button>
            <div id="buttonGroup">
                    <div id="frequencySection">
                        <webaudio-knob id="frequencySlider" src="./assets/imgs/slider.png" sprites="127" value=350 min="0" max="22050" step=1></webaudio-knob>
                        <p id="frequencyDisplayer" class="buttonTitle"> Frequency</p>
                    </div>
                    <div id="qSection">
                        <webaudio-knob id="qSlider" src="./assets/imgs/slider.png" sprites="127" value=0 min="0" max="100" step=1></webaudio-knob>
                        <p id="qDisplayer" class="buttonTitle"> Detune</p>
                    </div>
                    <div id="gainSection">
                        <webaudio-knob id="gainSlider" src="./assets/imgs/slider.png" sprites="127" value=1 min="0.0001" max="1000" step=0.01></webaudio-knob>
                        <p id="gainSlider" class="buttonTitle"> Gain</p>
                    </div>
                    <div id="volumeSection">
                        <webaudio-knob id="knobVolume" diameter="90" src="./assets/imgs/volumeButton.png" sprites="30" value=1 min="0" max="7" step=1></webaudio-knob>
                        <p  id="volumeTitle" class="buttonTitle"> Volume</p>
                    </div>
                    <div id="balanceSection">
                        <webaudio-knob id="knobBalance" diameter="90" src="./assets/imgs/balanceButton.png" sprites="127" value=1 min="0" max="2" step=0.1>Balance</webaudio-knob>
                        <p id="balanceTitle" class="buttonTitle"> Balance</p>
                    </div>
            </div>
        </div>
     </div>
     <a href="https://github.com/DSGAndre/TPLecteurAudioVideoJs"> Lien du Github</a>
     <a href="http://miageprojet2.unice.fr/Intranet_de_Michel_Buffa/Technlogies_Web_2_-_Master_2_Miage#Vid.c3.a9os_du_cours_et_TP_du_vendredi_30.2f10.2f2020_avec_le_MBDS"> Lien du cours </a>`;

let behaviourColor = "#FF5733";
let startButtonState;
let currentTimeChanged = true;

let x = 0;
let y = 0;
let interval;
let currentTimeCanvas;
let contextCurrentTime;

class MyAudioPlayer extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.basePath = new URL('.', import.meta.url); // url absolu du composant
        this.urlImgOn = this.basePath + "/" + "./assets/imgs/playState.png";
        this.urlImgOff = this.basePath + "/" + "./assets/imgs/pauseState.png";
        // Fix relative path in WebAudio Controls elements
        this.fixRelativeImagePaths();

        this.currentTimeDisplayer = this.shadowRoot.querySelector("#currentTimeDisplayer");
    }

    connectedCallback() {
        this.player = this.shadowRoot.querySelector("#myPlayer");
        this.player.loop = true;

        this.declareListeners();
        this.setTitle();
        //Faire une animation ou l'on met un cd voir un tourne disk

        // Create visual audio graph
        this.createVisualAudioGraph();
    }

    setTitle() {
        let songTitle = this.shadowRoot.querySelector("#myPlayer").getAttribute("src");
        //Remove slash and back slash
        let splitedTitle = songTitle.replace(".mp3", "").replace("\\", "/").split("/");
        // Get name of the song
        songTitle = splitedTitle[splitedTitle.length - 1];
        // Format camelCase title
        songTitle = songTitle.replace(/([A-Z])/g, ' $1');
        this.shadowRoot.querySelector("#songTitle").innerHTML = songTitle;
    }

    createVisualAudioGraph() {
        this.canvas = this.shadowRoot.querySelector("#audioVisual");
        this.context = this.canvas.getContext("2d");
        let audioElement = this.shadowRoot.querySelector("#myPlayer");
        if (!this.audioContext) {
            this.audioContext = new AudioContext();
        }

        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.source = this.audioContext.createMediaElementSource(audioElement);
        this.createBalancer();
        this.pannerNode = this.audioContext.createStereoPanner();
        this.source.connect(this.analyser);
        this.source.connect(this.pannerNode);
        this.source.connect(this.audioContext.destination);
        this.pannerNode.connect(this.audioContext.destination);
        this.data = new Uint8Array(this.analyser.frequencyBinCount);
        requestAnimationFrame(this.drawAnimation.bind(this));
    }

    createBalancer() {

        let balancerFilterFrequencySlider = this.shadowRoot.querySelector('#frequencySlider');
        let balancerFilterFrequencyValue = this.shadowRoot.querySelector('#frequencyOnScreen');
        let balancerFilterDetuneSlider = this.shadowRoot.querySelector('#qSlider');
        let balancerFilterDetuneValue = this.shadowRoot.querySelector('#qOnScreen');
        let balancerFilterQSlider = this.shadowRoot.querySelector('#gainSlider');
        let balancerFilterQValue = this.shadowRoot.querySelector('#gainOnScreen');
        let filterNode = this.audioContext.createBiquadFilter();
        let value;
        this.source.connect(filterNode);
        filterNode.connect(this.audioContext.destination);

        balancerFilterFrequencySlider.oninput = function (evt) {
            value = evt.target.value;
            filterNode.frequency.value = parseFloat(value);
            balancerFilterFrequencyValue.innerHTML = "Frequency :" + value + " Hz";
        };

        balancerFilterDetuneSlider.oninput = function (evt) {
            value = evt.target.value;
            filterNode.detune.value = parseFloat(value);
            balancerFilterDetuneValue.innerHTML = "Detune :" + value + " dB";
        };

        balancerFilterQSlider.oninput = function (evt) {
            value = evt.target.value;
            filterNode.Q.value = parseFloat(value);
            balancerFilterQValue.innerHTML = "Q :" + value;
        };
    }

    drawAnimation() {
        requestAnimationFrame(this.drawAnimation.bind(this));
        this.analyser.getByteFrequencyData(this.data);
        // check if sound is loud or not
        if (this.data.some(frequency => frequency >= 220))
            behaviourColor = "#FF5733";
        else
            behaviourColor = "#0099ff";
        this.context.strokeStyle = behaviourColor;
        this.draw(this.data);

        // update write current time
        this.setCurrentTime(this.player.currentTime);
    }

    draw(data) {

        data = [...data];
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let space = this.canvas.width / data.length;

        data.forEach((value, i) => {
            this.context.beginPath();
            this.context.moveTo(space * i, this.canvas.height); //x,y
            this.context.lineTo(space * i, this.canvas.height - value); //x,y
            this.context.stroke();
        })
    }

    fixRelativeImagePaths() {
        // change webaudiocontrols relative paths for spritesheets to absolute
        let webaudioControls = this.shadowRoot.querySelectorAll(
            'webaudio-knob, webaudio-slider, webaudio-switch, img, audio'
        );
        webaudioControls.forEach((e) => {
            let currentImagePath = e.getAttribute('src');
            if (currentImagePath !== undefined) {
                e.src = this.basePath + "/" + currentImagePath;
            }
        });

        let mixTable = this.shadowRoot.querySelector("#mixTable");
        mixTable.style.backgroundImage = "url(" + this.basePath + "/assets/imgs/backgroundVintage.jpg)";
        mixTable.style.borderRadius = "30px";

        this.clickSong = new Audio(this.basePath + "/assets/song/clickSound.wav");
    }

    declareListeners() {
        //this.player.currentTime=0;
        this.shadowRoot.querySelector("#playButton").addEventListener("click", () => {
            this.playSong();
        });

        this.shadowRoot.querySelector("#knobVolume").addEventListener("input", (event) => {
            this.setVolume(event.target.value);
        });

        this.shadowRoot.querySelector("#playButton").addEventListener("mouseover", (event) => {
            event.target.style.backgroundColor = startButtonState ? "indianred" : "darkolivegreen";
        });

        this.shadowRoot.querySelector("#knobBalance").addEventListener("input", (event) => {
            this.setBalance(event.target.value);
        });
    }

    setVolume(volumeValue) {
        this.player.volume = volumeValue / 7;
        this.updateVolumeDisplayer(volumeValue);
    }

    setCurrentTime(currentTime) {
        this.currentTimeDisplayer.innerHTML = this.formatTimer(currentTime) + "/" + this.formatTimer(this.player.duration);
    }

    setBalance(balanceValue) {
        let leftTextDisplayer = this.shadowRoot.querySelector("#leftOnScreen");
        let rightTextDisplayer = this.shadowRoot.querySelector("#rightOnScreen");

        let leftText = balanceValue === 1 ? "Left : " + 1 : balanceValue < 1 ? "Left : +" + (1 - balanceValue) : "Left : -" + (balanceValue - 1);
        let rightText = balanceValue === 1 ? "Right : " + 1 : balanceValue > 1 ? "Right : +" + (balanceValue - 1) : "Right : -" + (1 - balanceValue);
        leftTextDisplayer.innerHTML = leftText.substring(0, 11);
        rightTextDisplayer.innerHTML = rightText.substring(0, 12);

        this.pannerNode.pan.value = balanceValue - 1;
    }

    changePlayButton(state) {
        let onOffImg = this.shadowRoot.querySelector("#onOffImg");
        let playButton = this.shadowRoot.querySelector("#playButton");
        if (state) {
            this.player.play();
            onOffImg.setAttribute("src", this.urlImgOn);
            playButton.innerHTML = "Pause";
            playButton.style.backgroundColor = "indianred";
        } else {
            this.player.pause();
            onOffImg.setAttribute("src", this.urlImgOff);
            playButton.innerHTML = "Play";
            playButton.style.backgroundColor = "darkolivegreen";
        }
    }

    formatTimer(s) {
        s = ~~s;
        let secs = s % 60;
        s = (s - secs) / 60;
        let minutes = s % 60;
        let hours = (s - minutes) / 60;
        secs = +secs > 10 ? ':' + secs : ':' + 0 + "" + secs;
        minutes = minutes > 10 ? minutes : 0 + "" + minutes;
        hours = hours >= 1 ? hours + ":" : "";
        return hours + minutes + secs;
    }

    updateVolumeDisplayer(volumeValue) {
        this.shadowRoot.querySelector("#volumeOnScreen").innerHTML = "Volume : " + volumeValue;
        this.volumeDisplayer = this.shadowRoot.querySelector("#knobVolumeDisplayer");
    }

    setEffect(frequency) {

    }

    changeEffectStatue(element, state) {
        element.innerHTML = state ? "On" : "Off";
        element.style.color = state ? "green" : "red";
    }

    playSong() {

        if (startButtonState === undefined) {
            // On créer les listener une fois que le son à était lancer pour la première fois
            this.createCanvasRectCurrentTime();
            startButtonState = false;
            this.clickSong.play();
        }

        startButtonState = !startButtonState;
        this.changePlayButton(startButtonState);
        this.audioContext.resume();
        if (!startButtonState)
            clearInterval(interval);
        else
            interval = setInterval(this.drawRect, 1000);
    }

    createCanvasRectCurrentTime() {
        // create canvas context
        currentTimeCanvas = this.shadowRoot.querySelector("#rectCurrentTimeCanvas");
        contextCurrentTime = currentTimeCanvas.getContext("2d");
        currentTimeCanvas.addEventListener("mousedown", this.keyDownHandler.bind(this), true);

    }

    keyDownHandler() {
        // Stop movment and resume song NOT WORKING WELL
        clearInterval(interval);
        currentTimeChanged = false;
        this.playSong();
        this.keyMoveHandlerFunction = this.keyMoveHandler.bind(this);
        this.keyUpHandlerFunction = this.keyUpHandler.bind(this);
        currentTimeCanvas.addEventListener("mousemove", this.keyMoveHandlerFunction, false);
        currentTimeCanvas.addEventListener("mouseup", this.keyUpHandlerFunction, false);
    }

    keyMoveHandler(e) {
        interval = setInterval(this.drawRectDragAndDrop(e.clientX), 1000);
        console.log("in");
    }

    keyUpHandler(e) {
        // Removing event not working well
        clearInterval(interval);
        currentTimeCanvas.removeEventListener("mouseup", this.keyUpHandlerFunction, false);
        currentTimeCanvas.removeEventListener("mousemove", this.keyMoveHandlerFunction, false);
        this.player.currentTime = (e.clientX - 268.141) / 4.11;
        x = e.clientX;
        currentTimeChanged = true;
        interval = setInterval(this.drawRect, 1000);
        this.playSong();
    }

    drawRectDragAndDrop(position) {
        x = position - 268.141;
        this.drawRect();
    }

    drawRect() {
        console.log(x);
        let thisWidth = currentTimeCanvas.width;
        let thisHeight = currentTimeCanvas.height;
        x = x > (1285.700 + 268.141) ? 0 : x;
        contextCurrentTime.clearRect(0, 0, thisWidth, thisHeight);
        contextCurrentTime.beginPath();
        contextCurrentTime.rect(x, y, 0.92, thisHeight);
        contextCurrentTime.fillStyle = "#FF5733";
        contextCurrentTime.fill();
        contextCurrentTime.closePath();
        if (currentTimeChanged)
            x += 0.92;
    }

}

//https://jsfiddle.net/pL0bkc67/
customElements.define("my-audioplayer", MyAudioPlayer);


