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

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.mute = this.mute.bind(this);
    this.record = this.record.bind(this);
    this.toggleMic = this.toggleMic.bind(this);
  }

  componentDidMount() {
    
}

  updateTempo(e) {
    this.setState({
      tempo: e.target.value
    });
    
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.props.setTempo(this.state.tempo);
    }
  }
  updateVolume(e) {
    this.setState({
      volume: e.target.value 
    });
  }

  mute() {
    let vol = this.state.volume;
    if (vol > 5) {
      this.setState ({
        volume: 0,
        oldVolume: vol
      }, () => this.props.setVolume(this.state.volume));
      
    } else {
      this.setState ({
        volume: this.state.oldVolume,
        oldVolume: 0
      }, () => this.props.setVolume(this.state.volume));
     
    }
  }

  record() {
    if (!this.state.recording) {
      this.props.recorder.startRecording();
      if (!this.props.playing) this.props.togglePlay();
      console.log("recorder started");
      this.setState({
        recording: true
      });
    } else {
      this.props.recorder.finishRecording();
      console.log("recorder stopped");
      this.setState({
        recording: false
      });
      this.props.togglePlay();
    }
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

  render() {
    let playPause = () => {
      if (this.props.playing) {
        return (
          <i className="fas fa-pause transport-button"

            onClick={this.props.togglePlay}
            alt="Pause" />
        )
      } else {
        return (
          <i className="fas fa-play transport-button"

            onClick={this.props.togglePlay}
            alt="Play" />
        )
      }
  };

    return (
      <div className="transport">
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
          {playPause()}
          <i
            className="fas fa-stop transport-button"
            onClick={this.props.stopPlay}
            alt="Stop"
          />
          <i className={this.state.recording ? "fas fa-circle transport-button state-active" : "fas fa-circle transport-button"} onClick={this.record} />
          <i className={this.state.micActive ? "fas fa-microphone-alt transport-button state-active" : "fas fa-microphone-alt transport-button"} onClick={this.toggleMic}/>
          <i className="fas fa-bullhorn transport-button" onClick={this.props.airhorn}/>
          <i className="fas fa-video transport-button" onClick={this.toggleModal}/>
          <GiphySearchModal className="giphy-search-modal" toggleModal={this.toggleModal} setGif={this.props.setGif}/>
        </div>
      </div>
    )
  }


}





export default Transport;