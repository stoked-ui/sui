import * as React from 'react';
import { CaretRightOutlined, PauseOutlined } from '@mui/icons-material/Pause';
import { TimelineEngine } from '@stoked-ui/timeline';
import './index.less';
import { mockData, mockEffect } from './mock';
import lottieControl from './lottieControl';

export default function TimelineEditorG() {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const [time, setTime] = React.useState(0);
  const timelineEngine = React.useRef<TimelineEngine>();
  const playerPanel = React.useRef<HTMLDivElement>();

  React.useEffect(() => {
    const engine = new TimelineEngine();
    timelineEngine.current = engine;
    timelineEngine.current.effects = mockEffect;
    timelineEngine.current.data = mockData;
    timelineEngine.current.on('play', () => setIsPlaying(true));
    timelineEngine.current.on('paused', () => setIsPlaying(false));
    timelineEngine.current.on('afterSetTime', ({ time: afterSetTime }) => setTime(afterSetTime));
    timelineEngine.current.on('setTimeByTick', ({ time: timeByTick }) => setTime(timeByTick));

    let dur = 0;
    mockData.forEach(row => {
      row.actions.forEach(action => {
        dur = Math.max(dur, action.end)
      });
    })
    setDuration(dur);

    return () => {
      if (!timelineEngine.current) {
        return;
      }
      timelineEngine.current.pause();
      timelineEngine.current.offAll();
      lottieControl.destroy();
    };
  }, []);

  // 开始或暂停
  const handlePlayOrPause = () => {
    if (!timelineEngine.current) {
      return;
    }
    if (timelineEngine.current.isPlaying) {
      timelineEngine.current.pause();
    } else {
      timelineEngine.current.play({ autoEnd: true });
    }
  };

  const handleSetTime = (value: number) => {
    timelineEngine.current.setTime(Number(value));
    timelineEngine.current.reRender();
  }

  // 时间展示
  const timeRender = (renderTime: number) => {
    const float = (`${parseInt(`${(renderTime % 1) * 100}`, 10)}`).padStart(2, '0');
    const min = (`${parseInt(`${renderTime / 60}`, 10)}`).padStart(2, '0');
    const second = (`${parseInt(`${renderTime % 60}`, 10)}`).padStart(2, '0');
    return <React.Fragment>{`${min}:${second}.${float}`}</React.Fragment>;
  };

  return (
    <div className="timeline-editor-engine">
      <div className="player-panel" id="player-ground-2" ref={playerPanel}/>
      <div className="timeline-player">
        <div className="play-control" onClick={handlePlayOrPause}>
        </div>
        <div className="play-time">
          <div className="play-time-current">{timeRender(time)}</div>

          <div className="play-time-duration">{timeRender(duration)}</div>
        </div>
      </div>
    </div>
  );
};
