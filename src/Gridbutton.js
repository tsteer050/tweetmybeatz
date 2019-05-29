import React, { Fragment } from 'react';
import './grid.css';

class Gridbutton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
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

  render() {
    return (
      <Fragment>
        <button onClick={this.handleClick} className={this.state.active ? `grid-button active-button ${this.props.highlight}` : "grid-button inactive-button"}/>
      </Fragment>
    )
  }
}


export default Gridbutton;