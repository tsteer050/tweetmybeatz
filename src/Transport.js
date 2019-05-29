import React from 'react';
import './transport.css';


class Transport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tempo: this.props.tempo,
      volume: this.props.volume,
      oldVolume: 0,
      recording: false
    };

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.mute = this.mute.bind(this);
    this.record = this.record.bind(this);
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
      this.props.mediaRecorder.start();
      console.log(this.props.mediaRecorder.state);
      console.log("recorder started");
      this.setState({
        recording: true
      });
    } else {
      this.props.mediaRecorder.stop();
      console.log(this.props.mediaRecorder.state);
      console.log("recorder stopped");
      this.setState({
        recording: false
      });
    }
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
        </div>
        <div className="transport-buttons">
          {playPause()}
          <i
            className="fas fa-stop transport-button"
            onClick={this.props.stopPlay}
            alt="Stop"
          />
          <button onClick={this.record}>Record</button>
          <i className="fas fa-bullhorn transport-button" onClick={this.props.airhorn}/>
        </div>
      </div>
    )
  }


}





export default Transport;