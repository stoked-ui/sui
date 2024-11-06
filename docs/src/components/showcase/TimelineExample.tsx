import { TimelineFile, AudioController } from "@stoked-ui/timeline";
import {namedId} from "@stoked-ui/media-selector";

const idFunc = () => namedId('track');

const TimelineExample = new TimelineFile({
  name: 'Sample UI - Demo',
  description: 'Demonstrate features of the sample UI editor',
  author: 'Your Name',
  created: 1729783494563,
  backgroundColor: '#000',
  tracks: [
    {
      id: idFunc(),
      name: 'Nature Sounds',
      url: 'https://www.soundjay.com/nature/sounds/rain-1.mp3',
      controller: AudioController,
      actions: [{
        name: 'nature-sounds',
        start: 0,
        end: 30,
        volume: [
          [0, 0, 15],
          [1, 15, 25],
          [0, 25, ]
        ],
      }]
    },
    {
      id: idFunc(),
      name: 'Background Music',
      url: 'https://www.bensound.com/bensound-music/bensound-ukulele.mp3',
      controller: AudioController,
      actions: [{
        name: 'ukulele-music',
        start: 0,
        end: 60,
        trimStart: 5,
        loop: true,
      }]
    },
    {
      id: idFunc(),
      name: 'Intro Sound',
      url: 'https://www.soundjay.com/button/sounds/button-16.mp3',
      controller: AudioController,
      actions: [{
        name: 'intro-sound',
        start: 0,
        end: 2,
      }]
    },
    {
      id: idFunc(),
      name: 'Outro Sound',
      url: 'https://www.soundjay.com/button/sounds/button-9.mp3',
      controller: AudioController,
      actions: [{
        name: 'outro-sound',
        start: 0,
        end: 2,
        volume: [[0.5, 0,]],
      }]
    },
    {
      id: idFunc(),
      name: 'Calm Piano',
      url: 'https://www.bensound.com/bensound-music/bensound-love.mp3',
      image: 'https://www.bensound.com/bensound-img/bensound-love.jpg',
      controller: AudioController,
      actions: [{
        name: 'calm-piano',
        start: 5,
        end: 40,
        trimStart: 2,
        volume: [[0, 5, 10], [1, 10, 20],],
      }]
    },
  ]
});

export default TimelineExample;
