import {IController, ControllerParams} from "@stoked-ui/timeline";

abstract class Controller implements IController {
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

  abstract enter(params: ControllerParams): void;

  abstract leave(params: ControllerParams): void;

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

export default Controller;
