import React from 'react';
import './transport.css';
import GiphySearchModal from './GiphySearchModal';

class Transport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tempo: this.props.tempo,
      volume: this.props.volume,
      oldVolume: 0,
      recording: false,
      micActive: false
    };

    this.recordTimer = null;

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.mute = this.mute.bind(this);
    this.record = this.record.bind(this);
    this.toggleMic = this.toggleMic.bind(this);
    this.renderRecordButton = this.renderRecordButton.bind(this);
    this.stopRecord = this.stopRecord.bind(this);
    this.renderVideoButton = this.renderVideoButton.bind(this);
    this.renderMicButton = this.renderMicButton.bind(this);
    this.renderPlayPauseButton = this.renderPlayPauseButton.bind(this);
    this.renderAirhornButton = this.renderAirhornButton.bind(this);
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.props.setTempo(this.state.tempo);
    }
  }

  mute() {
    let vol = this.state.volume;
    if (vol > 5) {
      this.setState({
        volume: 0,
        oldVolume: vol
      }, () => this.props.setVolume(this.state.volume));

    } else {
      this.setState({
        volume: this.state.oldVolume,
        oldVolume: 0
      }, () => this.props.setVolume(this.state.volume));
    }
  }

  record() {
    if (!this.state.recording) {
      this.props.recorder.start();
      if (!this.props.playing) this.props.togglePlay();
      this.setState({
        recording: true
      });

      this.toggleProgressBar();

      this.recordTimer = setTimeout(() => {

        this.toggleProgressBar();
        this.setState({
          recording: false
        });
        this.props.stopPlay();
        this.props.finishRecord();
      

      }, 8000);
    } else {
      this.props.recorder.stop();
      this.setState({
        recording: false
      });
      this.props.togglePlay();
      this.props.emptyChunks();
    }
  }

  renderAirhornButton() {
    return (
      <div className="label-div">
        <i className="fas fa-bullhorn transport-button" onClick={this.props.airhorn} />
        <h5 className="label-text">Airhorn</h5>
      </div>
    )
  }

  renderMicButton() {
    return (
      <div className="label-div">
        <i className={this.state.micActive ? "fas fa-microphone-alt transport-button state-active" : "fas fa-microphone-alt transport-button"} onClick={this.toggleMic} />
        <h5 className="label-text">Enable</h5>
        <h5 className="label-text">mic</h5>
      </div>
    )
  }

  renderPlayPauseButton() {
      if (this.props.playing) {
        return (
          <div className="label-div">
            <i className="fas fa-pause transport-button"
              onClick={this.props.stopPlay}
              alt="Pause" />
            <h5 className="label-text">Play/</h5>
            <h5 className="label-text">pause</h5>
          </div>
        )
      } else {
          return (
            <div className="label-div">
              <i className="fas fa-play transport-button"
                onClick={this.props.togglePlay}
                alt="Play" />
              <h5 className="label-text">Play/</h5>
              <h5 className="label-text">pause</h5>
            </div>
          )
        } 
      }
    

  renderRecordButton() {
    let classString = "";
    if (this.props.beatExists && this.props.gif ) classString = " glowing";
    if (this.props.recordPossible) {
      return (
        <div className="label-div">
          <i
            className={this.state.recording ? "fas fa-circle transport-button state-active" : "fas fa-circle transport-button" + classString}
            onClick={this.state.recording ? "" : this.record} />
          <h5 className="label-text">Record</h5>
        </div>
      )
    } else {
      return (
        <div className="label-div">
          <i className="fas fa-exclamation-circle transport-button inactive-button" title="Program a beat and pick a gif to enable recording" />
          <h5 className="label-text">Record</h5>
        </div>
      )
    }
  }

  renderVideoButton() {
    if (this.props.instructionNumber < 3) {
      return (
        <div className="label-div">
          <i className="fas fa-video transport-button inactive-button" />
          <h5 className="label-text">Select</h5>
          <h5 className="label-text">a gif</h5>
        </div>
      )
    } else {
      return (
        <div className="label-div">
          <i
            className={this.props.instructionNumber === 3 ? "fas fa-video transport-button glowing" : "fas fa-video transport-button"}
            onClick={this.toggleModal}
          />          
          <h5 className="label-text">Select</h5>
          <h5 className="label-text">a gif</h5>
        </div>
      )
    }
  }

  stopRecord() {
    this.props.stopRecord();
    clearTimeout(this.recordTimer);
    this.toggleProgressBar();
    this.setState({
      recording: false
    });
    this.props.stopPlay();
  }

  toggleMic() {
    this.props.toggleMic();
    this.setState({
      micActive: !this.state.micActive
    });
  }

  toggleModal() {
    let modal = document.getElementById("giphy-search-modal-view");
    modal.classList.toggle("visible");
  }

  toggleProgressBar() {
    let progressBar = document.getElementById('progress-bar-div');
    let progressBarValue = document.getElementById('progress-value');
    progressBar.classList.toggle('visible');
    progressBarValue.classList.toggle('progress-value');
  }

  updateTempo(e) {
    this.setState({
      tempo: e.target.value
    });
    
  }

  updateVolume(e) {
    this.setState({
      volume: e.target.value 
    });
  }

  render() {

    return (
      <div className="transport">
        <h1 className="app-title"><i className="fab fa-twitter" />tweet my beatz</h1>
        <div className="volume-controls">
          <i className={this.state.volume < 5 ? "fas fa-volume-mute mute-button" : "fas fa-volume-up mute-button"} onClick={this.mute}></i>
          <input type="range" min="0" max="100" className="volume-slider" value={this.state.volume} onChange={(e) => { this.updateVolume(e); this.props.setVolume(this.state.volume); }} />
        </div>
        <div className="tempo-controls">
          <h5>BPM:</h5>
          <input className="tempo-input" type="number" value={this.state.tempo} onChange={(e) => this.updateTempo(e)} onKeyDown={(e) => this.handleKeyPress(e)} />
          <div>
            <select className="kit-select" onChange={(e) => this.props.changeKit(e.target.value)}>
              <option value="Default">Default</option>
              <option value="Boutique">Boutique</option>
              <option value="Electro">Electro</option>
              <option value="Heavy">Heavy</option>
              <option value="Street">Street</option>
            </select>
          </div>
        </div>
        <div className="transport-buttons">
          {this.renderPlayPauseButton()}
          {this.renderMicButton()}
          {this.renderAirhornButton()}
          {this.renderVideoButton()}
          {this.renderRecordButton()}
          <GiphySearchModal className="giphy-search-modal" toggleModal={this.toggleModal} setGif={this.props.setGif} beatExists={this.props.beatExists} registerBeatExists={this.props.registerBeatExists}/>
        </div>
        <div className="outer-progress-bar-div">
          <div id="progress-bar-div">
            <div className="progress-bar">
              <span id="progress-value" />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Transport;