const pianoKeys = document.querySelectorAll(".piano-keys .key"),
    volumeSlider = document.querySelector(".volume-slider input"),
    keysCheckbox = document.querySelector(".keys-checkbox input"),
    sustainCheckbox = document.getElementById("sustain");



let allKeys = [],
    activeKeys = {},
    sustain = false,
    isRecording = false,
    recordedNotes = [];

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const loadAudioBuffer = async (key) => {
    const response = await fetch(`tunes/${key}.wav`);
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
};

const playTune = async (key) => {
    const audioBuffer = await loadAudioBuffer(key);
    const audioSource = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();

    audioSource.buffer = audioBuffer;
    audioSource.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.value = volumeSlider.value;

    audioSource.start(0);

    if (sustain) {
        gainNode.gain.setValueAtTime(1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 5);
        audioSource.stop(audioContext.currentTime + 5);
    } else {
        audioSource.stop(audioContext.currentTime + 0.5);
    }

    const clickedKey = document.querySelector(`[data-key="${key}"]`);
    if (clickedKey) {
        clickedKey.classList.add("active");
        setTimeout(() => {
            clickedKey.classList.remove("active");
        }, sustain ? 5000 : 150);
    }

    if (isRecording) {
        recordedNotes.push({ key, time: audioContext.currentTime });
    }
};

pianoKeys.forEach(key => {
    allKeys.push(key.dataset.key);
    key.addEventListener("click", () => playTune(key.dataset.key));
});

const handleVolume = (e) => {
    // Volume is handled in playTune with gainNode.gain.value
};

const showHideKeys = () => {
    pianoKeys.forEach(key => key.classList.toggle("hide"));
};

const pressedKey = (e) => {
    if (allKeys.includes(e.key) && !activeKeys[e.key]) {
        activeKeys[e.key] = true;
        playTune(e.key);
    }
};

const releasedKey = (e) => {
    if (allKeys.includes(e.key)) {
        activeKeys[e.key] = false;
    }
};

const handleSustain = (e) => {
    sustain = e.target.checked;
};

const startRecording = () => {
    isRecording = true;
    recordedNotes = [];
    recordButton.disabled = true;
    stopButton.disabled = false;
    saveButton.disabled = true;
};

const stopRecording = () => {
    isRecording = false;
    recordButton.disabled = false;
    stopButton.disabled = true;
    saveButton.disabled = false;
};

const saveRecording = () => {
    const recordedData = JSON.stringify(recordedNotes);
    const blob = new Blob([recordedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recording.json';
    a.click();
    URL.revokeObjectURL(url);
};

keysCheckbox.addEventListener("click", showHideKeys);
volumeSlider.addEventListener("input", handleVolume);
sustainCheckbox.addEventListener("click", handleSustain);
document.addEventListener("keydown", pressedKey);
document.addEventListener("keyup", releasedKey);

