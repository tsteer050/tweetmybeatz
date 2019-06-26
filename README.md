## TweetMyBeatz

TweetMyBeatz is a web-app built using Node.js, Express, and React.  Its main feature is a step-sequencer, an instrument which allows users to create beats by activating buttons on a grid where the y axis represents different instruments and the x axis represents positions in time where those instruments can be triggered to play.  This section was built using the Web Audio API to create the audio signal chain and custom React components for the interactive pieces.  

Other features include a modal linked to the Giphy API to select a gif to pair with your beat, a record function which uses the Media Recorder API to combine both your beat and the chosen gif into a single mp4, and integration of Twitter OAuth which allows you to post your finished video to your Twitter account.

![Screenshot](https://github.com/tsteer050/tweet-my-beats/blob/master/readme%20images/ss.png)
