class ShadowStage {

  static getStage(host: HTMLElement | null = null) : HTMLDivElement {
    if (ShadowStage._stage) {
      return ShadowStage._stage;
    }
    ShadowStage._stage = ShadowStage._createStage(host);
    return ShadowStage._stage;
  }

  static _createStage(host: HTMLElement | null = null) : HTMLDivElement {
    const stageHost = host || document.body;
    const stage = document.createElement("div");
    stage.id = 'shadow-stage';
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

  private static _stage: HTMLDivElement | null = null;

  static setStage(stage: HTMLDivElement) {
    if (!ShadowStage._stage) {
      ShadowStage._stage = stage;
    }
  }
}
export default ShadowStage;
