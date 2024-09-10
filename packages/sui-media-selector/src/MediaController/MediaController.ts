import IMediaController, {MediaControllerParams} from "./MediaController.types";

abstract class MediaController implements IMediaController {
  id: string;

  name: string;

  colorSecondary: string;

  color: string;

  constructor(options: {
    id: string,
    name: string,
    color: string,
    colorSecondary: string
  }) {
    this.id = options.id;
    this.name = options.name;
    this.color = options.color;
    this.colorSecondary = options.colorSecondary;
  }

  abstract enter(params: MediaControllerParams): void;

  abstract leave(params: MediaControllerParams): void;

/*
  getBackgroundImage?: GetBackgroundImage = async (action: ITimelineAction) => {
    const screenShotContainer = document.createElement('div');
    const animation = AnimationType.load({action, container: screenShotContainer, mode: 'svg'});
    console.log('animation', screenShotContainer, animation);

    screenShotContainer.childNodes.forEach(child => {
      if (child instanceof HTMLElement) {
        console.log(child.id, child);
      }
    })
    return `url(${'s'})`;
  } */
}

export default MediaController;
