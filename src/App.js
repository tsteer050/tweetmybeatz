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
          <h1 className="app-title splash-title"><i className="fab fa-twitter" />tweet my beatz</h1>
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
