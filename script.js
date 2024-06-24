let ballPosition;
let selectedCup=1;  // Inicialmente, el cubo seleccionado es el primero
let gameOver = false; // Variable para controlar el fin de la partida al acertar

// Configuración de AudioContext y StereoPannerNode
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let successSoundBuffer;
let failureSoundBuffer;

// Cargar los sonidos de éxito y fallo
fetch('success.mp3')
    .then(response => response.arrayBuffer())
    .then(data => audioContext.decodeAudioData(data))
    .then(buffer => successSoundBuffer = buffer)
    .catch(e => console.error('Error al cargar success.mp3', e));

fetch('failure.mp3')
    .then(response => response.arrayBuffer())
    .then(data => audioContext.decodeAudioData(data))
    .then(buffer => failureSoundBuffer = buffer)
    .catch(e => console.error('Error al cargar failure.mp3', e));

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function placeBall() {
    ballPosition = getRandomInt(1, 3);
    const ball = document.createElement('div');
    ball.classList.add('ball');
    document.getElementById(`cup${ballPosition}`).appendChild(ball);
}

function playSound(buffer, panValue) {
    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    const panner = audioContext.createStereoPanner();
    panner.pan.value = panValue;

    source.connect(panner).connect(audioContext.destination);
    source.start();
}

function highlightSelectedCup() {
    document.querySelectorAll('.cup').forEach((cup, index) => {
        if (index === selectedCup - 1) {
            cup.classList.add('selected');
        } else {
            cup.classList.remove('selected');
        }
    });
}

function removeHighlightSelectedCup() {
    document.querySelectorAll('.cup').forEach((cup, index) => {
            cup.classList.remove('selected');
    });
}

function checkCup(cupNumber) {
    if (gameOver)
        return;
    const message = document.getElementById('message');
    
    // Determinar el valor del panning basado en el cubo seleccionado
    let panValue;
    switch(cupNumber) {
        case 1: panValue = -1; break; // Izquierda
        case 2: panValue = 0; break;  // Centro
        case 3: panValue = 1; break;  // Derecha
    }

    if (cupNumber === ballPosition) {
        message.textContent = "¡Correcto! Encontraste la bola.";
        document.querySelector(`#cup${ballPosition} .ball`).style.display = 'block';
        playSound(successSoundBuffer, panValue);
        gameOver = true;
    } else {
        message.textContent = "Incorrecto. Intenta de nuevo.";
        playSound(failureSoundBuffer, panValue);
    }
}

function resetGame() {
    document.querySelectorAll('.ball').forEach(ball => ball.remove());
    document.getElementById('message').textContent = '';
    placeBall();
    selectedCup = 1;  // Resetear la selección al primer cubo
    gameOver = false;
    if(document.fullscreenElement){
        highlightSelectedCup();
    }
}

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function lockPointer() {
    document.body.requestPointerLock();
}

function onPointerLockChange() {
    if (document.pointerLockElement === document.body) {
        console.log('Pointer locked');
    } else {
        console.log('Pointer unlocked');
    }
}

function handleKeyDown(event) {
    if (gameOver)
        return;
    if (document.fullscreenElement) {
        switch (event.key) {
            case 'ArrowLeft':
                selectedCup = (selectedCup === 1) ? 3 : selectedCup - 1;
                highlightSelectedCup();
                break;
            case 'ArrowRight':
                selectedCup = (selectedCup === 3) ? 1 : selectedCup + 1;
                highlightSelectedCup();
                break;
            case 'a':
                checkCup(selectedCup);
                break;
        }
    }
}

function handleClick() {
    if (document.fullscreenElement) {
        lockPointer();
    }
}

window.onload = function() {
    placeBall();
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            lockPointer();
            toggleFullScreen();
            highlightSelectedCup();
            if(document.fullscreenElement){
                removeHighlightSelectedCup();
            }
        }
        if (event.key === 'r') {
            resetGame();
        }
    });
    
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClick);
}
