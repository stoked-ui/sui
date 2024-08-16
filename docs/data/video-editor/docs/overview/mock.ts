import {
  TimelineActionType
} from '@stoked-ui/timeline';

export const scaleWidth = 160;
export const scale = 2;
export const startLeft = 20;

export const mockData: TimelineActionType[] = [
  {
    id: '0',
    actions: [
      {
        id: 'action0',
        start: 9.5,
        end: 16,
        effectId: 'animation',
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
        effectId: 'animation',
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
        effectId: 'animation',
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
        effectId: 'audio',
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
        effectId: 'video',  // Use the new video effect
        data: {
          src: '/static/timeline/docs/overview/sample.mp4',
          name: 'Sample Video',
        },
      },
    ],
  },
];
