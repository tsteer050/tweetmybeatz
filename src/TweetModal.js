import React from 'react';
import Axios from 'axios';

import './tweetmodal.css';


// const io = window.io;
import io from 'socket.io-client';
const API_URL = process.env.NODE_ENV === 'production' ? '' : 'http://127.0.0.1:5000';


class TweetModal extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      user: null,
      inputText: "",
      url: null
    };
    this.checkPopup = this.checkPopup.bind(this);
    this.closeCard = this.closeCard.bind(this);
    this.openPopup = this.openPopup.bind(this);
    this.startAuth = this.startAuth.bind(this);
    this.sendTweetRequest = this.sendTweetRequest.bind(this);
  }

  componentDidMount() {
    this.socket = io.connect(process.env.NODE_ENV === 'production' ? 'https://tweetmybeatz.herokuapp.com' : 'http://127.0.0.1:5000');

    this.socket.on('user', user => {
      this.popup.close();
      this.setState({ user }, () => {
        this.sendTweetRequest();
      });

      this.socket.on('connection', message => console.log(message))
    });
  }

  componentDidUpdate() {
    if(this.props.blob && this.state.url === null) {
      let url = URL.createObjectURL(this.props.blob);
      this.setState({
        url
      });
      let video = document.getElementById('modal-video');
      video.load();
    }
  }

  checkPopup() {
    const check = setInterval(() => {
      const { popup } = this
      if (!popup || popup.closed || popup.closed === undefined) {
        clearInterval(check);
        this.setState({ disabled: '' });
      }
    }, 1000);
  }

  closeCard() {
    this.setState({ user: {} });
  }

  downloadVideo() {
    window.open("https://www.tweetmybeatz.com/download");
  }

  handleInputSubmit(e) {
    e.preventDefault();
    this.tweetVideo();
    this.setState({
      inputText: "",
      url: null
    });
  }

  handleInputUpdate(e) {
    if (e.target.value.length <= 280) {
      this.setState({
        inputText: e.target.value
      });
    }
  }

  openPopup() {
    const width = 600, height = 600;
    const left = (window.innerWidth / 2) - (width / 2);
    const top = (window.innerHeight / 2) - (height / 2);

    const url = `${API_URL}/twitter?socketId=${this.socket.id}`;

    return window.open(url, '',
      `toolbar=no, location=no, directories=no, status=no, menubar=no, 
      scrollbars=no, resizable=no, copyhistory=no, width=${width}, 
      height=${height}, top=${top}, left=${left}`
    );
  }

  renderDownloadButton() {
    return (
      <div className="label-div">
        <i className="fas fa-file-download transport-button"
          alt="Download" onClick={(e) => this.downloadVideo()}/>
        <h5 className="label-text">Download</h5>
        <h5 className="label-text">Video</h5>
      </div>
    )
  }

  renderTweetButton() {
    return (
      <div className="label-div">
        <i className="fas fa-paper-plane transport-button" onClick={(e) => this.handleInputSubmit(e)}/>
        <h5 className="label-text">Send</h5>
        <h5 className="label-text">Tweet</h5>
      </div>
    )
  }

  renderTwitterLoginButton() {
    if (!this.state.user) {
      return (
        <div className="label-div">
          <i className="fab fa-twitter transport-button glowing" onClick={this.startAuth} />
          <h5 className="label-text">Login to</h5>
          <h5 className="label-text">Twitter</h5>
        </div>
      )
    } else {
      return (
        <div className="label-div">
          <i className="fas fa-check-square transport-button success" />
          <h5 className="success label-text">Logged</h5>
          <h5 className="success label-text">In!</h5>
        </div>
      )
    }
  }

  sendTweetRequest() {
    let data = new FormData();
    data.set('blob', this.props.blob);
    data.set('oauth_token', this.state.user.token);
    data.set('oauth_token_secret', this.state.user.tokenSecret);
    data.set('handle', this.state.user.name);
    data.set('text', this.state.inputText);
    let requestUrl = API_URL + '/video';

    Axios.post(requestUrl, data).then(function (response) {
    }).catch(function (error) {
      throw (error);
    });
  }

  startAuth() {
    if (!this.state.disabled) {
      this.popup = this.openPopup();
      this.checkPopup();
      this.setState({ disabled: 'disabled' });
    }
  }

  toggleModal() {
    let tweetModal = document.getElementById('tweet-modal');
    tweetModal.classList.toggle('visible');
    let video = document.getElementById('modal-video');
    video.src = "";
  }

  tweetVideo() {
    if (!this.state.user) {
      this.startAuth();
    } else {
      this.sendTweetRequest();
    }
  }

  render() {
    return (
      <div id="tweet-modal" className="tweet-modal">
        <button className="close-modal-button" onClick={this.toggleModal}>X</button>
        <h1 className="modal-title">Send it!</h1>
        <div className="tweet-content-div">
          <video id="modal-video" className="video" controls>
            <source src={this.state.url ? this.state.url : ""} type="video/webm"/>
          </video>
          <div className="text-input-div">
            <form className="tweet-form" >
              <div className="tweet-textarea-div">
                <textarea
                  maxLength="280"
                  className="tweet-text-input"
                  placeholder="#tweetmybeatz"
                  value={this.state.inputText}
                  onChange={(e) => this.handleInputUpdate(e)}
                />
              </div>
              <div className="form-controls">
                <h5 className="character-limit-text">{280 - this.state.inputText.length} characters remaining</h5>
              </div>
              <div className="form-buttons">
                {this.renderTwitterLoginButton()}
                {this.renderDownloadButton()}
                

                {this.renderTweetButton()}
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

}


export default TweetModal;