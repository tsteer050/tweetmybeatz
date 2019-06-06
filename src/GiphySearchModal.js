import React from 'react';
import './giphysearchmodal.css';
import Axios from 'axios';
const GphApiClient = require('giphy-js-sdk-core');
const client = GphApiClient("270ZtAJzJVTLdVI0kokYOtcmulH62RHj");

class GiphySearchModal extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      search: "",
      selected: null,
      results: []
    };
    this.mapSearchResults = this.mapSearchResults.bind(this);
    this.search = this.search.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }


  handleChange(e) {
    this.setState({
      search: e.target.value
    });
  }

  search(e) {
    e.preventDefault();
    client.search('gifs', { "q": this.state.search })
      .then((response) => {
        
        response.data.forEach((gifObject) => {
          let oldResults = this.state.results;
          oldResults.push(gifObject);
          this.setState({
            results: oldResults
          });
        })
      })
      .catch((err) => {
        console.log(err);
      });
  }

  handleClick(url) {
    let set = this.props.setGif;
    Axios.get(`/gif/?url=${url}`)
      .then(function (response) {
        set(response.config.url);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
    // this.props.setGif(url);
    if (this.props.instructionNumber === 3) {
      this.props.registerGifChosen();
    }
    this.props.toggleModal();
  }

  mapSearchResults() {
    return this.state.results.map(result => {
      return <img alt="gif" className="giphy-search-result" src={result.images.downsized.url} onClick={() => this.handleClick(result.images.looping.mp4)}/>
    });
  }


  render() {

    return (
      <div id="giphy-search-modal-view" className="giphy-search-modal-view">
        <h1>hi</h1>
        <button onClick={this.props.toggleModal}>X</button>
        <form onSubmit={(e) => this.search(e)}>
          <input type="text" placeholder="Enter search here..." onChange={(e) => this.handleChange(e)} />
        </form>
        <div className="search-results">
          {this.mapSearchResults()}
        </div>
      </div>
    )
  }
}

export default GiphySearchModal;