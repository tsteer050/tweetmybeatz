import React from 'react';
import Grid from './Grid';
import Transport from './Transport';
import Axios from 'axios';

import defaultSamples from './resources/samples/DefaultSamples';
import boutiqueSamples from './resources/samples/Boutique 78/BoutiqueSamples';
import electroSamples from './resources/samples/Electro/ElectroSamples';
import heavySamples from './resources/samples/Heavy/HeavySamples';
import streetSamples from './resources/samples/Street/StreetSamples';

import './sequencer.css';

const API_URL = process.env.NODE_ENV === 'production' ? '' :'http://127.0.0.1:5000';
const io = window.io;

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
    this.listener = false;
    this.popup = null;
    this.blob = null;
    this.instructions = [
      "",
      "Create a beat using the buttons below",
      "Press play to hear your beat",
      "Click to select a gif",
      "Click to sign in to Twitter",
      "Click record to generate your video",
      "Enter the text for your Tweet and click to send",
      "You Tweeted a sick beat.  People probably like you now"
    ];
    
    this.state = {
      inputText: "",
      user: null,
      disabled: '',
      instructionNumber: 1,
      playing: false,
      tempo: 80,
      currentBeat: 1,
      timerInProgress: false,
      volume: 100,
      gif: null,
      recorder: null,
      recordPossible: false,
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
    this.configureRecorder = this.configureRecorder.bind(this);
    this.stopRecord = this.stopRecord.bind(this);
    this.finishRecord = this.finishRecord.bind(this);
    this.tweetVideo = this.tweetVideo.bind(this);
    this.changeInstructionNumber = this.changeInstructionNumber.bind(this);
    this.emptyChunks = this.emptyChunks.bind(this);
    this.playSample = this.playSample.bind(this);

    this.closeCard = this.closeCard.bind(this);
    this.startAuth = this.startAuth.bind(this);
    this.openPopup = this.openPopup.bind(this);
    this.checkPopup = this.checkPopup.bind(this);
  }

 
  componentDidMount() {
    this.socket = io.connect(process.env.NODE_ENV === 'production' ? 'https://tweetmybeatz.herokuapp.com' : 'http://127.0.0.1:5000');

    this.socket.on('user', user => {
      this.popup.close();
      this.setState({ user });

      this.socket.on('connection', message => console.log(message))
    });
    try {
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

    samples.forEach(key => {
      const sample = defaultSamples[key];
      const sampleAudio = new Audio(sample);
      const track = this.audioContext.createMediaElementSource(sampleAudio);
      track.connect(this.gainNode);
      
      let newSamples = this.state.samples;
      newSamples[key] = sampleAudio;
      this.setState({
        samples: newSamples
      });
    });
    const sample = defaultSamples["Airhorn"];
    const sampleAudio = new Audio(sample);
    const track = this.audioContext.createMediaElementSource(sampleAudio);
    track.connect(this.gainNode);

    let newSamples = this.state.samples;
    newSamples["Airhorn"] = sampleAudio;
    this.setState({
      samples: newSamples
    });
    
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        this.microphone = this.audioContext.createMediaStreamSource(stream);
        this.micGainNode = this.audioContext.createGain();
        this.micGainNode.connect(this.gainNode);
        this.microphone.connect(this.micGainNode);
        this.micGainNode.gain.value = 0;
      });
  }

  addActiveSample(sample, beat) {
    let newActiveSamples = this.state.activeSamples;
    newActiveSamples[beat].push(sample);
    this.setState({
      activeSamples: newActiveSamples
    });
  }

  airhorn() {
    let resetSample = this.state.samples;
    resetSample["Airhorn"].currentTime = 0;
    this.setState({
      samples: resetSample
    });
    this.state.samples["Airhorn"].play();
  }

  changeInstructionNumber(num) {
    if (this.state.instructionNumber === num - 1) {
      this.setState({
        instructionNumber: num
      });
    }
  }

  changeKit(kit) {
    let newSamples = this.state.samples;
    samples.forEach(key => {
      newSamples[key].src = kits[kit][key];
    });
    this.setState({
      samples: newSamples
    });
  }
  
  checkPopup() {
    const check = setInterval(() => {
      const { popup } = this
      if (!popup || popup.closed || popup.closed === undefined) {
        clearInterval(check);
        this.setState({ disabled: '' });
      }
    }, 1000);
  }

  closeCard() {
    this.setState({ user: {} });
  }

  componentDidUpdate() {
    this.play();
    if (this.state.user) this.changeInstructionNumber(5);
  }

  configureRecorder() {

    let video = document.getElementById("video");
    let videoTrack = video.captureStream().getVideoTracks()[0];
    let audioTrack = this.audioDestination.stream.getAudioTracks()[0];

    let combined = new MediaStream([videoTrack, audioTrack]);
    var options = { mimeType: 'video/webm' };
    let recorder = new MediaRecorder(combined, options);

    recorder.ondataavailable = (e) => {
      this.chunks.push(e.data);
    };

    recorder.onstop = () => {
      if (this.chunks.length) {
        this.blob = new Blob(this.chunks, { type: 'video/webm' });
        this.changeInstructionNumber(6);
      }
    };
    this.recorder = recorder;
  }

  emptyChunks() {
    this.chunks = [];
  }

  finishRecord() {
    this.recorder.stop();
    this.chunks = [];
  }

  handleInputSubmit(e) {
    e.preventDefault();
    this.tweetVideo();
    this.setState({
      inputText: "",
      instructionNumber: 7
    });
  }

  handleInputUpdate(e) {
    if (e.target.value.length <= 240) {
      this.setState({
        inputText: e.target.value
      });
    }
  }

  incrementBeat() {
    let beat = this.state.currentBeat + 1;
    if (beat > 16) beat = 1;
    this.setState({
      currentBeat: beat
    });
  }

  nextBeat() {
    let nextBeat = this.state.currentBeat + 1;
    if (nextBeat > 16) nextBeat = 1;
    this.setState({
      currentBeat: nextBeat
    });
  }

  openPopup() {
    const width = 600, height = 600;
    const left = (window.innerWidth / 2) - (width / 2);
    const top = (window.innerHeight / 2) - (height / 2);

    const url = `${API_URL}/twitter?socketId=${this.socket.id}`;

    return window.open(url, '',
      `toolbar=no, location=no, directories=no, status=no, menubar=no, 
      scrollbars=no, resizable=no, copyhistory=no, width=${width}, 
      height=${height}, top=${top}, left=${left}`
    );
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
    let resetSample = this.state.samples;
    resetSample[sample].currentTime = 0;
    this.setState({
      samples: resetSample
    });
    this.state.samples[sample].play();
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


  setGif(gif) {
    this.setState({
      gif: gif,
      recordPossible: false
    }, () => {
      let video = document.getElementById("video");
      if (this.listener) {
        video.removeEventListener('loadeddata', this.listener);
      }
      this.listener = () => {
        if (video.readyState >= 2) {
          if (!this.recorder) this.configureRecorder();
          this.setState({
            recordPossible: true
          });
        }
      };
      video.addEventListener('loadeddata', this.listener);
      video.load();
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
  }

  startAuth() {
    if (!this.state.disabled) {
      this.popup = this.openPopup();
      this.checkPopup();
      this.setState({ disabled: 'disabled' });
    }
  }

  stopPlay() {
    this.setState({
      playing: false,
      currentBeat: 0,
      timerInProgress: false
    });
  }

  stopRecord() {
    this.recorder.stop();
    this.chunks = [];
  }

  toggleMic() {
    this.micGainNode.gain.value === 0 ? this.micGainNode.gain.value = 1 : this.micGainNode.gain.value = 0;
  }

  togglePlay() {
    if (this.state.instructionNumber === 2) {
      this.setState({
        instructionNumber: 3
      });
      let instruction = document.getElementById('instruction-text');
      instruction.innerHTML = "Select a gif";
    }
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

  tweetVideo() {
    let data = new FormData();
    data.set('blob', this.blob);
    data.set('oauth_token', this.state.user.token);
    data.set('oauth_token_secret', this.state.user.tokenSecret);
    data.set('handle', this.state.user.name);
    data.set('text', this.state.inputText);
    let requestUrl = API_URL + '/video';

    Axios.post(requestUrl, data).then(function (response) {
    }).catch(function (error) {
      throw (error);
    });
  }

  renderGif() {
    if (this.state.instructionNumber === 6) {
      return (
        <div className="text-input-div">
          <form className="tweet-form" >
            <div className="tweet-textarea-div">
              <textarea
                maxLength="280"
                className="tweet-text-input"
                placeholder="#tweetmybeatz"
                value={this.state.inputText}
                onChange={(e) => this.handleInputUpdate(e)}
              />
            </div>
            <div className="form-controls">
              <button className="tweet-submit-button glowing" type="submit" onClick={(e) => this.handleInputSubmit(e)}><i className="fab fa-twitter small-twitter-icon"/></button>
              <h5 className="character-limit-text">{280 - this.state.inputText.length} characters remaining</h5>
            </div>
          </form>
        </div>
      )
    } else {
      return (
        <video id="video" className="video" autoPlay loop>
          <source src={this.state.gif ? this.state.gif : ""} type="video/mp4" />
        </video>
      );
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
            configureRecorder={this.configureRecorder}
            stopRecord={this.stopRecord}
            finishRecord={this.finishRecord}
            instructionNumber={this.state.instructionNumber}
            recordPossible={this.state.recordPossible}
            changeInstructionNumber={this.changeInstructionNumber}
            emptyChunks={this.emptyChunks}

            closeCard={this.closeCard}
            startAuth={this.startAuth}
            openPopup={this.openPopup}
            checkPopup={this.checkPopup}
            disabled={this.state.disabled}
            user={this.state.user}

          />
          <div className="video-div">
            
            {this.renderGif()}
          </div>
        </div>
        <h3 id="instruction-text" className="instruction-text">{this.instructions[this.state.instructionNumber]}</h3>
        <Grid 
        playing={this.state.playing}
        addActiveSample={this.addActiveSample}
        removeActiveSample={this.removeActiveSample}
        currentBeat={this.state.currentBeat}
        activeSamples={this.state.activeSamples}
        instructionNumber={this.state.instructionNumber}
        changeInstructionNumber={this.changeInstructionNumber}
        playSample={this.playSample}
        />
      </div>
    )
  }
}

export default Sequencer;