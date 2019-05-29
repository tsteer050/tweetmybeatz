import React from 'react';
import Grid from './Grid';
import Transport from './Transport';
import kick from './resources/samples/kick.mp3';
import snare from './resources/samples/snare.mp3';
import hihatC from './resources/samples/hihat-c.mp3';
import hihatO from './resources/samples/hihat-o.mp3';
import cymbal from './resources/samples/cymbal.mp3';
import airhorn from './resources/samples/airhorn.mp3';
import './sequencer.css';
import FileSaver from 'file-saver';

const samples = [
  "Kick",
  "Snare",
  "Hihat (c)", 
  "HiHat (o)",
  "Cymbal",
  "Airhorn"
];

const linkedSamples = {
  "Kick": kick,
  "Snare": snare,
  "Hihat (c)": hihatC,
  "HiHat (o)": hihatO,
  "Cymbal": cymbal,
  "Airhorn": airhorn
};

class Sequencer extends React.Component {
  constructor(props) {
    super(props);

    this.chunks = [];
    
    this.state = {
      playing: false,
      tempo: 80,
      currentBeat: 1,
      timerInProgress: false,
      volume: 100,
      activeSamples: {
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
        7: [],
        8: [],
        9: [],
        10: [],
        11: [],
        12: [],
        13: [],
        14: [],
        15: [],
        16: []

      },
      samples: {
        // "Kick": new Audio(kick),
        // "Snare": new Audio(snare),
        // "Hihat (c)": new Audio(hihatC),
        // "HiHat (o)": new Audio(hihatO),
        // "Cymbal": new Audio(cymbal),
        // "Airhorn": new Audio(airhorn)
      }
    };
    this.setTempo = this.setTempo.bind(this);
    this.togglePlay = this.togglePlay.bind(this);
    this.stopPlay = this.stopPlay.bind(this);
    this.addActiveSample = this.addActiveSample.bind(this);
    this.removeActiveSample = this.removeActiveSample.bind(this);
    this.play = this.play.bind(this);
    this.setVolume = this.setVolume.bind(this);
    this.airhorn = this.airhorn.bind(this);
  }

  componentWillMount() {
    try {
      // Fix up for prefixing
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
    }
    catch (e) {
      alert('Web Audio API is not supported in this browser');
    }
  }

  componentDidMount() {
    this.gainNode = this.audioContext.createGain();
    this.audioDestination = this.audioContext.createMediaStreamDestination();
    this.gainNode.connect(this.audioDestination);
    this.mediaRecorder = new MediaRecorder(this.audioDestination.stream);
    samples.forEach(key => {
      const sample = linkedSamples[key];
      const sampleAudio = new Audio(sample);
      const track = this.audioContext.createMediaElementSource(sampleAudio);
      track.connect(this.gainNode).connect(this.audioContext.destination);
      
      this.state.samples[key] = sampleAudio;
    });
    this.mediaRecorder.ondataavailable = (e) => {
      this.chunks.push(e.data);
      console.log('data');
      debugger
    };



    this.mediaRecorder.onstop = function (e) {
      console.log("data available after MediaRecorder.stop() called.");
 

      // var clipName = prompt('Enter a name for your sound clip');

      // var clipContainer = document.createElement('article');
      // var clipLabel = document.createElement('p');
      // var audio = document.createElement('audio');
      // var deleteButton = document.createElement('button');

      // clipContainer.classList.add('clip');
      // audio.setAttribute('controls', '');
      // deleteButton.innerHTML = "Delete";
      // clipLabel.innerHTML = clipName;

      // clipContainer.appendChild(audio);
      // clipContainer.appendChild(clipLabel);
      // clipContainer.appendChild(deleteButton);
      // soundClips.appendChild(clipContainer);

      let audio = new Audio();
      audio.controls = true;
      console.log(this.chunks);
      var blob = new Blob(this.chunks, { type: 'audio/webm;codecs=opus' });
      this.chunks = [];
      var audioURL = URL.createObjectURL(blob);
      audio.src = audioURL;
      // send audio to be converted
      console.log("recorder stopped, attempting to convert");

      var ffmpeg = require('ffmpeg');
      try {
        var process = new ffmpeg(blob);
        var processed;
        process.then(audio => {
          audio.fnExtractSoundToMP3(processed, function (error, file) {
            if (!error) console.log('Audio file: ' + file);
          });
        }, err => {
          console.log('Error: ' + err);
        });
        FileSaver.saveAs(processed, "newbeat.mp3");

      }
      catch (e) {
        console.log(e.code);
        console.log(e.msg);
      }

      
    };
    
  }

  componentDidUpdate() {
    this.play();
  }

  addActiveSample(sample, beat) {
    let newActiveSamples = this.state.activeSamples;
    newActiveSamples[beat].push(sample);
    this.setState({
      activeSamples: newActiveSamples
    });
  }

  removeActiveSample(sample, beat) {
    let newActiveSamples = this.state.activeSamples;
    if (newActiveSamples[beat].length === 1) {
      newActiveSamples[beat] = [];
    } else {
      newActiveSamples[beat] = newActiveSamples[beat].filter(activeSample => activeSample !== sample);
    }
    this.setState({
      activeSamples: newActiveSamples
    });
  }

  incrementBeat() {
    let beat = this.state.currentBeat + 1;
    if (beat > 16) beat = 1;
    this.setState({
      currentBeat: beat
    });
  }

  play() {
    if (!this.state.timerInProgress) {
      this.setState({
        timerInProgress: true
      });
      var bpm = this.state.tempo;
      var interval = ((60 / bpm) / 4) * 1000;
      setTimeout(() => {
        if (this.state.playing) {
          this.incrementBeat();
          this.setState({
            timerInProgress: false
          });
          this.state.activeSamples[this.state.currentBeat].forEach(sample => {
            this.playSample(sample);
          });
          this.play();
        }
        
      }, interval);
    }
  }
  
  playSample(sample) {
    this.state.samples[sample].currentTime = 0;
    this.state.samples[sample].play();
  }

  togglePlay() {

    this.setState({
      playing: !this.state.playing
    });
    if (this.state.playing) {
      this.play();
    } else {
      this.setState({
        timerInProgress: false
      });
    }
  }

  stopPlay() {
    this.setState({
      playing: false,
      currentBeat: 0,
      timerInProgress: false
    });
  }

  nextBeat() {
    let nextBeat = this.state.currentBeat + 1;
    if (nextBeat > 16) nextBeat = 1;
    this.setState({ 
      currentBeat: nextBeat
     });
  }

  setTempo(newTempo) {
    this.setState({
      tempo: newTempo
    });
  }

  setVolume(vol) {
    let newVolume = vol;
    if (newVolume < 5) newVolume = 0;
    this.setState({
      volume: newVolume
    });
    this.gainNode.gain.value = newVolume / 100;
    // samples.forEach(sample => this.state.samples[sample].volume = newVolume / 100);
  }

  airhorn() {
    this.state.samples["Airhorn"].currentTime = 0;
    this.state.samples["Airhorn"].play();
  }

  render() {
    return (
      <div className="sequencer">
        <div className="sequencer-top">
          <Transport
            togglePlay={this.togglePlay}
            stopPlay={this.stopPlay}
            playing={this.state.playing}
            setTempo={this.setTempo}
            tempo={this.state.tempo}
            volume={this.state.volume}
            setVolume={this.setVolume}
            airhorn={this.airhorn}
            mediaRecorder={this.mediaRecorder}
          />
          <h1 className="app-title">cool beats bro</h1>

        </div>
        <Grid 
        playing={this.state.playing}
        addActiveSample={this.addActiveSample}
        removeActiveSample={this.removeActiveSample}
        currentBeat={this.state.currentBeat}
        activeSamples={this.state.activeSamples}
        />
      </div>
    )
  }
}

export default Sequencer;