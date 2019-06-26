## TweetMyBeatz

TweetMyBeatz is a web-app built using Node.js, Express, and React.  Its main feature is a step-sequencer, an instrument which allows users to create beats by activating buttons on a grid where the y axis represents different instruments and the x axis represents positions in time where those instruments can be triggered to play.  This section was built using the Web Audio API to create the audio signal chain and custom React components for the interactive pieces.  

Other features include a modal linked to the Giphy API to select a gif to pair with your beat, a record function which uses the Media Recorder API to combine both your beat and the chosen gif into a single mp4, and integration of Twitter OAuth which allows you to post your finished video to your Twitter account.  `fluent-ffmpeg` is also utilized in order to convert the webm video output by `MediaRecorder` to mp4 format, a requirement for Twitter.

You can check out the live deployment [here.](https://tweetmybeatz.herokuapp.com)

![Screen Shot 2019-06-26 at 9 00 45 AM](https://user-images.githubusercontent.com/6785491/60199875-bc1a4580-97f9-11e9-89c6-2fb341700225.png)

The code below shows the setup of the `MediaRecorder` responsible for combining both the audio input of the step-sequencer and the gif selected by the user.  It is important to note that attempting to call `captureStream()` on a video vile with an external source will fail due to cors restrictions.  This is circumvented by using `urlDownloader` to save the selected gif in mp4 format locally and capturing the stream of the resulting `<video>` element.
```
// sequencer.js

configureRecorder() {

  let video = document.getElementById("video");
  let videoTrack = video.captureStream().getVideoTracks()[0];
  let audioTrack = this.audioDestination.stream.getAudioTracks()[0];

  let combined = new MediaStream([videoTrack, audioTrack]);
  var options = { mimeType: 'video/webm' };
  let recorder = new MediaRecorder(combined, options);

  recorder.ondataavailable = (e) => {
    this.chunks.push(e.data);
  };

  recorder.onstop = () => {
    if (this.chunks.length) {
      this.blob = new Blob(this.chunks, { type: 'video/webm' });
      this.changeInstructionNumber(6);
    }
  };
  this.recorder = recorder;
}
```

Local saving of chosen gif in mp4 format:

```
// index.js
app.get('/gif', (req, res) => {
  const downloader = new urlDownload();
  const url = req.query.url;
  downloader.get(url, 'gifs');
  let subdir = '/';
  downloader.on('done', filename => {
    console.log(filename);
    setTimeout(() => {
      res.sendFile(__dirname + subdir + filename)
    }, 500);
  });
});
```

The sequencer itself is implemented using a series of Web Audio API nodes.  Sources are created for each type of sample (kick drum, snare, etc.), connected to a gain node, then patched to a master gain node leading to the `audioDestination` from which the overall audio stream is recorded.  
```
// sequencer.js

this.gainNode = this.audioContext.createGain();
this.audioDestination = this.audioContext.createMediaStreamDestination();
this.gainNode.connect(this.audioDestination);
this.gainNode.connect(this.audioContext.destination);

samples.forEach(key => {
  const sample = defaultSamples[key];
  const sampleAudio = new Audio(sample);
  const track = this.audioContext.createMediaElementSource(sampleAudio);
  track.connect(this.gainNode);
  let newSamples = this.state.samples;
  newSamples[key] = sampleAudio;
  this.setState({
    samples: newSamples
  });
});
```

On the backend, `fluent-ffmpeg` is used for conversion to mp4 using the following code.  It is important to note that `ffmpeg` is a dependency and must be installed separately.  This necessitated use of a Docker container in order to push to Heroku, which does not natively support `apt-get` commands.  Another possible solution would involve the [heroku-buildpack-apt](https://github.com/heroku/heroku-buildpack-apt) buildpack, but fewer `apt` commands are supported compared to installing in Docker making this approach less preferable.  
```
// index.js

ffmpeg(url)
  .toFormat('mp4')
  .on('progress', function (progress) {
    console.log('Processing: ' + progress.percent + '% done');
  })
  .on('end', function (err) {
    console.log('done!');
    setTimeout(() => _twitterVideoPub(myTweetObj, () => console.log("resolved")), 2000);
  })
  .on('error', function (err) {
    console.log('an error happened: ' + err.message);
  })
  .save('beat.mp4');
```



