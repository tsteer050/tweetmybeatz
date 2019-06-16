import React from 'react';
import Sequencer from './Sequencer';
import './App.css';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      load: false
    };
  }


  render() {

    if (!this.state.load) {
      return (
        <div className="App">
          <button className="start-button glowing" onClick={() => this.setState({load: true})}>Drop the beat</button>
        </div>
      )
    } else {
      return (
        <div className="App">
          <Sequencer />
        </div>
      );
    }

  }

}

export default App;
