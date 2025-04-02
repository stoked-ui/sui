class Stage {
  private static _stages: Record<string, HTMLDivElement> = {};

  private static getName(host: string) {
    return `stage-${host}`;
  }

  private static getTempName(host: string) {
    return `temp-stage-${host}`;
  }

  static getStage(host: string) : HTMLDivElement {

    const name = this.getName(host);
    const tempName = this.getTempName(host);
    let stage = Stage._stages[name];
    let tempStage = Stage._stages[tempName];

    if (stage) {
      // do we have a temp stage
      if (tempStage) {
        // transfer everything from temp stage if it exists
        const stageChildren = Array.from(tempStage.children);
        for (let i = 0; i < stageChildren.length; i += 1) {
          const child = stageChildren[i];
          console.info('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
          console.info(`moving from ${tempName} to ${name}`);
          console.info('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
          stage.appendChild(child);
        }
        delete Stage._stages[tempName] ;
      }
      return stage;
    }
    if (tempStage) {
      return tempStage;
    }

    stage = document.querySelector(`#${name}`) as HTMLDivElement;
    if (!stage) {
      console.info(`Stage not found with id: #${name}`);
      tempStage = Stage._createStage(host);
      Stage._stages[tempName] = tempStage;
      return tempStage;
    }
    Stage._stages[`#stage-${host}`] = stage;
    return stage;
  }

  static getElementById(id: string)
  {
    const stages = Object.values(Stage._stages);
    for (let i = 0; i < stages.length; i += 1) {
      const stageDiv = stages[i];
      const element = stageDiv.querySelector(`#${id}`);
      if (element) {
        return element;
      }
    }
    return null;
  }

  static _createStage(host: string) : HTMLDivElement {
    const tempName = this.getTempName(host);
    console.info('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    console.info(`creating ${tempName}`);
    console.info('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')

    const stageHost = document.body;
    const stage = document.createElement("div");
    stage.id = tempName;
    stage.style.position = 'absolute';
    stage.style.top = '50%';
    stage.style.left = '50%';
    stage.style.width = '100%';
    stage.style.height = '100%';
    stage.style.pointerEvents = 'none';
    stage.style.zIndex = '49';
    stage.style.display = 'none';
    stageHost.appendChild(stage);
    return stage;
  }
}
export default Stage;

