import React from 'react';
import Gridbutton from './Gridbutton';
import './grid.css';

class Gridrow extends React.Component {

  checkMeter() {
    if (this.props.currentBeat === 0) return false;

    return (this.props.activeSamples[this.props.currentBeat].includes(this.props.sample)) && this.props.playing;
  }

  renderButtons() {
    let array = [];
    for (let i = 1; i < 17; i++) {
      array.push(i);
    }
    return array.map(i => {
      return (
        <Gridbutton
          key={i}
          addActiveSample={this.props.addActiveSample}
          removeActiveSample={this.props.removeActiveSample}
          beat={i}
          sample={this.props.sample}
          instructionNumber={this.props.instructionNumber}
          changeInstructionNumber={this.props.changeInstructionNumber}
          highlight={(this.props.playing && i === this.props.currentBeat) ? "highlight-grid-button" : ""}
        />
      )
    });
  }

  render() {
    return (
      <div>
        <div className="grid-row">
          <button className="grid-row-sample-button" onClick={() => this.props.playSample(this.props.sample)}>{this.props.sample}</button>
          <div className={this.checkMeter() ? "meter meter-active" : "meter meter-off"}/>
          <div className="grid-row-buttons">
            {this.renderButtons()}
          </div>
        </div>
      </div>
    )
  }
}

export default Gridrow;