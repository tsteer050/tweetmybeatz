import React, { Fragment } from 'react';
import './grid.css';

class Gridbutton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false
    };
    this.handleClick = this.handleClick.bind(this);
    this.generateClassName = this.generateClassName.bind(this);
  }

  handleClick() {
    if (!this.props.beatCreated) {
      this.props.registerBeatCreated();
    }
    if (this.state.active) {
      this.props.removeActiveSample(this.props.sample, this.props.beat);
      this.setState({
        active: false
      });
    } else {
      this.props.addActiveSample(this.props.sample, this.props.beat);
      this.setState({
        active: true
      });
    }
  }

  generateClassName() {
    let className = "grid-button";
    className += (this.state.active ? " active-button" : " inactive-button");
    className += ([1, 5, 9, 13].includes(this.props.beat) ? " downbeat" : "");
    className += " " + this.props.highlight;
    return className;
  }

  render() {
    return (
      <Fragment>
        <button onClick={this.handleClick} className={this.generateClassName()}/>
      </Fragment>
    )
  }
}


export default Gridbutton;