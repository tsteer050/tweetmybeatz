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
      inputText: null
    };
  }

  componentDidMount() {
    this.socket = io.connect(process.env.NODE_ENV === 'production' ? 'https://tweetmybeatz.herokuapp.com' : 'http://127.0.0.1:5000');

    this.socket.on('user', user => {
      this.popup.close();
      this.setState({ user });

      this.socket.on('connection', message => console.log(message))
    });
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

  renderTweetButton() {
    if (!this.state.user) {
      return (
        <div>
          <i className="fab fa-twitter transport-button glowing" onClick={this.startAuth} />
          <h5>Login to Twitter</h5>
        </div>
      )
    } else {
      return (
        <div>
          <i className="fab fa-twitter transport-button inactive-button" />
          <h5>Login to Twitter</h5>
        </div>
      )
    }
  }

  startAuth() {
    if (!this.state.disabled) {
      this.popup = this.openPopup();
      this.checkPopup();
      this.setState({ disabled: 'disabled' });
    }
  }

  tweetVideo() {
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

  render() {
    return (
      <div id="tweet-modal" className="tweet-modal">
        <h1>Tweeting modal</h1>
        <video id="video" className="video" autoPlay loop>
          <source src={this.props.blob ? this.props.blob : ""} type="video/mp4" />
        </video>
        {this.renderTweetButton()}
      </div>
    )
  }

}


export default TweetModal;