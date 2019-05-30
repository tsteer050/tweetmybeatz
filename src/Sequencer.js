import React from 'react';
import Grid from './Grid';
import Transport from './Transport';


import defaultSamples from './resources/samples/DefaultSamples';
import boutiqueSamples from './resources/samples/Boutique 78/BoutiqueSamples';
import electroSamples from './resources/samples/Electro/ElectroSamples';
import heavySamples from './resources/samples/Heavy/HeavySamples';
import streetSamples from './resources/samples/Street/StreetSamples';

import './sequencer.css';
import FileSaver from 'file-saver';



const WebAudioRecorder = window.WebAudioRecorder;


const kits = {
  "Default": defaultSamples,
  "Boutique": boutiqueSamples,
  "Electro": electroSamples,
  "Heavy": heavySamples,
  "Street": streetSamples
};

const samples = [
  "Kick",
  "Snare",
  "HiHat (c)", 
  "HiHat (o)",
  "Cymbal"
];

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
      gif: null,
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
      samples: {}
    };
    this.setTempo = this.setTempo.bind(this);
    this.togglePlay = this.togglePlay.bind(this);
    this.stopPlay = this.stopPlay.bind(this);
    this.addActiveSample = this.addActiveSample.bind(this);
    this.removeActiveSample = this.removeActiveSample.bind(this);
    this.play = this.play.bind(this);
    this.setVolume = this.setVolume.bind(this);
    this.airhorn = this.airhorn.bind(this);
    this.toggleMic = this.toggleMic.bind(this);
    this.changeKit = this.changeKit.bind(this);
    this.setGif = this.setGif.bind(this);
    this.renderGif = this.renderGif.bind(this);
  }

 
  componentDidMount() {

    try {
      // Fix up for prefixing
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      
    }
    catch (e) {
      alert('Web Audio API is not supported in this browser');
    }

    this.gainNode = this.audioContext.createGain();
    this.audioDestination = this.audioContext.createMediaStreamDestination();
    this.gainNode.connect(this.audioDestination);
    this.gainNode.connect(this.audioContext.destination);
    // this.mediaRecorder = new MediaRecorder(this.audioDestination.stream);
    samples.forEach(key => {
      const sample = defaultSamples[key];
      const sampleAudio = new Audio(sample);
      const track = this.audioContext.createMediaElementSource(sampleAudio);
      track.connect(this.gainNode);
      
      this.state.samples[key] = sampleAudio;
    });
    const sample = defaultSamples["Airhorn"];
    const sampleAudio = new Audio(sample);
    const track = this.audioContext.createMediaElementSource(sampleAudio);
    track.connect(this.gainNode);

    this.state.samples["Airhorn"] = sampleAudio;
    

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        this.microphone = this.audioContext.createMediaStreamSource(stream);
        this.micGainNode = this.audioContext.createGain();
        this.micGainNode.connect(this.gainNode);
        this.microphone.connect(this.micGainNode);
        this.micGainNode.gain.value = 0;
      });


    
    this.recorder = new WebAudioRecorder(this.gainNode, {
      workerDir: "./javascripts/"     // must end with slash
    });
    this.recorder.setEncoding("mp3");

    this.recorder.onComplete = (recorder, blob) => {
      FileSaver.saveAs(blob, "newbeat.mp3");
    };
  }

  componentDidUpdate() {
    this.play();
  }

  setGif(gif) {
    this.setState({
      gif: gif
    });
  }

  toggleMic() {
    this.micGainNode.gain.value === 0 ? this.micGainNode.gain.value = 1 : this.micGainNode.gain.value = 0;
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

  changeKit(kit) {
    samples.forEach(key => {
      this.state.samples[key].src = kits[kit][key];
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

  renderGif() {
    if (this.state.gif) {
      return (
      <video width="100" height="100" autoPlay>
        <source src={this.state.gif} type="video/mp4" />
      </video>
      )
    }      
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
            recorder={this.recorder}
            toggleMic={this.toggleMic}
            changeKit={this.changeKit}
            setGif={this.setGif}
          />
          <h1 className="app-title">cool beats bro</h1>
          {this.renderGif()}
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