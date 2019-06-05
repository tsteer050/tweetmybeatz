import React from 'react';
import Gridrow from './Gridrow';
import './grid.css';

class Grid extends React.Component {
  constructor(props) {
    super(props);
    this.state = ({
      playing: this.props.playing
    });
  }

  componentDidUpdate() {
    if (this.props.beatCreated) this.removeGridGlow();
  }

  removeGridGlow() {
    let grid = document.getElementById('grid');
    if (grid.classList.contains('glowing')) {
      grid.classList.remove('glowing');
    }
    let text = document.getElementById('instruction-text');
    text.innerHTML = "Press play to hear your beat";
  }

  renderRows() {
    let samples = ["Kick", "Snare", "HiHat (c)", "HiHat (o)", "Cymbal"];
    return samples.map(i => {
      return (
        <Gridrow
          key={i}
          playing={this.props.playing}
          addActiveSample={this.props.addActiveSample}
          removeActiveSample={this.props.removeActiveSample}
          sample={i}
          currentBeat={this.props.currentBeat}
          activeSamples={this.props.activeSamples}
          beatCreated={this.props.beatCreated}
          registerBeatCreated={this.props.registerBeatCreated}
        />
      )

    });
  }

  renderRowBottomMarkers() {
    let array = [];
    for (let i = 1; i < 17; i++) {
      array.push(i);
    }
    return array.map(number => {
      return <h5 key={number} className={this.props.currentBeat === number ? "selected-beat" : ""}>{number}</h5>
    })
  }

  render() {
    return (
      <div id="grid" className="grid glowing">
        {this.renderRows()}
        <div className="row-bottom-markers">
          {this.renderRowBottomMarkers()}
        </div>
      </div>
    )
  }


}





export default Grid;