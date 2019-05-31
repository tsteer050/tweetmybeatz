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
          <button onClick={() => this.setState({load: true})}>Hit me with them beats homie!</button>
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
