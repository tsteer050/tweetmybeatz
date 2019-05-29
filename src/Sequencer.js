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

const samples = [
  "Kick",
  "Snare",
  "Hihat (c)", 
  "HiHat (o)",
  "Cymbal"
];

class Sequencer extends React.Component {
  constructor(props) {
    super(props);
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
        "Kick": new Audio(kick),
        "Snare": new Audio(snare),
        "Hihat (c)": new Audio(hihatC),
        "HiHat (o)": new Audio(hihatO),
        "Cymbal": new Audio(cymbal),
        "Airhorn": new Audio(airhorn)
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
    samples.forEach(sample => this.state.samples[sample].volume = newVolume / 100);
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