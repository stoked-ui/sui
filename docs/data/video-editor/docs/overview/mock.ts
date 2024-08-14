import { TimelineAction, TimelineEffect, TimelineRow } from '@stoked-ui/timeline';
import audioControl from './audioControl';
import lottieControl from './lottieControl';
import videoControl from './videoControl';  // Import the new video control

export const scaleWidth = 160;
export const scale = 2;
export const startLeft = 20;

export interface CustomTimelineAction extends TimelineAction {
  data: {
    src: string;
    name: string;
  };
}

export interface CusTomTimelineRow extends TimelineRow {
  actions: CustomTimelineAction[];
}

export const mockEffect: Record<string, TimelineEffect> = {
  effect0: {
    id: 'effect0',
    name: 'Play sound effects',
    source: {
      start: ({ action, engine, isPlaying, time }) => {
        if (isPlaying) {
          const src = (action as CustomTimelineAction).data.src;
          audioControl.start({ id: src, src, startTime: action.start, engine, time });
        }
      },
      enter: ({ action, engine, isPlaying, time }) => {
        if (isPlaying) {
          const src = (action as CustomTimelineAction).data.src;
          audioControl.start({ id: src, src, startTime: action.start, engine, time });
        }
      },
      leave: ({ action, engine }) => {
        const src = (action as CustomTimelineAction).data.src;
        audioControl.stop({ id: src, engine });
      },
      stop: ({ action, engine }) => {
        const src = (action as CustomTimelineAction).data.src;
        audioControl.stop({ id: src, engine });
      },
    },
  },
  effect1: {
    id: 'effect1',
    name: 'Play animation',
    source: {
      enter: ({ action, time }) => {
        const src = (action as CustomTimelineAction).data.src;
        lottieControl.enter({ id: src, src, startTime: action.start, endTime: action.end, time });
      },
      update: ({ action, time }) => {
        const src = (action as CustomTimelineAction).data.src;
        lottieControl.update({ id: src, src, startTime: action.start, endTime: action.end, time });
      },
      leave: ({ action, time }) => {
        const src = (action as CustomTimelineAction).data.src;
        lottieControl.leave({ id: src, startTime: action.start, endTime: action.end, time });
      },
    },
  },
  effect2: {  // New video effect
    id: 'effect2',
    name: 'Play video',
    source: {
      enter: ({ action, time }) => {
        const src = (action as CustomTimelineAction).data.src;
        videoControl.enter({ id: src, src, startTime: action.start, endTime: action.end, time });
      },
      update: ({ action, time }) => {
        const src = (action as CustomTimelineAction).data.src;
        videoControl.update({ id: src, src, startTime: action.start, endTime: action.end, time });
      },
      leave: ({ action, time }) => {
        const src = (action as CustomTimelineAction).data.src;
        videoControl.leave({ id: src, startTime: action.start, endTime: action.end, time });
      },
    },
  },
};

export const mockData: CusTomTimelineRow[] = [
  {
    id: '0',
    actions: [
      {
        id: 'action0',
        start: 9.5,
        end: 16,
        effectId: 'effect1',
        data: {
          src: '/static/timeline/docs/overview/lottie1.json',
          name: 'LIKE',
        },
      },
    ],
  },
  {
    id: '1',
    actions: [
      {
        id: 'action1',
        start: 5,
        end: 9.5,
        effectId: 'effect1',
        data: {
          src: '/static/timeline/docs/overview/lottie2.json',
          name: 'TASK',
        },
      },
    ],
  },
  {
    id: '2',
    actions: [
      {
        id: 'action2',
        start: 0,
        end: 5,
        effectId: 'effect1',
        data: {
          src: '/static/timeline/docs/overview/lottie3.json',
          name: 'MilkCow',
        },
      },
    ],
  },
  {
    id: '3',
    actions: [
      {
        id: 'action3',
        start: 0,
        end: 20,
        effectId: 'effect0',
        data: {
          src: '/static/timeline/docs/overview/bg.mp3',
          name: 'BACKGROUND MUSIC',
        },
      },
    ],
  },
  {
    id: '4',
    actions: [
      {
        id: 'action4',
        start: 0,
        end: 10,
        effectId: 'effect2',  // Use the new video effect
        data: {
          src: '/static/timeline/docs/overview/sample.mp4',
          name: 'Sample Video',
        },
      },
    ],
  },
];
