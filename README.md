## TweetMyBeatz

TweetMyBeatz is a web-app built using Node.js, Express, and React.  Its main feature is a step-sequencer, an instrument which allows users to create beats by activating buttons on a grid where the y axis represents different instruments and the x axis represents positions in time where those instruments can be triggered to play.  This section was built using the Web Audio API to create the audio signal chain and custom React components for the interactive pieces.  

Other features include a modal linked to the Giphy API to select a gif to pair with your beat, a record function which uses the Media Recorder API to combine both your beat and the chosen gif into a single mp4, and integration of Twitter OAuth which allows you to post your finished video to your Twitter account.

![Screenshot](https://github.com/tsteer050/tweet-my-beats/blob/master/readme%20images/ss.png)

configure the recorder (MediaRecorder)
```
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

sample setup:
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

fluent-ffmpeg: 
```
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

node-url-downloader:
```
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
