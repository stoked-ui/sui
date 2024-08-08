export interface IResolution {
  width?: number;
  height?: number;
}

export type ResolutionProps = { width?: number, height?: number };

/**
 * @description Base interface for an editor file
 * @interface
 * @property {File | String} src - The src of the file
 */
export default class Resolution implements IResolution {
  width?: number;
  height?: number;

  public VideoResolution(props: ResolutionProps) {
    this.width = props.width;
    this.height = props.height;
  }
};

export class StandardDefinition extends Resolution {
  public StandardDefinition() {
    this.width = 640;
    this.height = 480;
  }
}

export class HighDefinition extends Resolution {
  public HighDefinition() {
    this.width = 1280;
    this.height = 720;
  }
}

export class FullHighDefinition extends Resolution {
  public FullHighDefinition() {
    this.width = 1920;
    this.height = 1080;
  }
}

export class QuadHighDefinition extends Resolution {
  public QuadHighDefinition() {
    this.width = 2560;
    this.height = 1440;
  }
}

export class UltraHighDefinition extends Resolution {
  public UltraHighDefinition() {
    this.width = 3840;
    this.height = 2160;
  }
}

export class EightKDefinition extends Resolution {
  public EightKDefinition() {
    this.width = 7680;
    this.height = 4320;
  }
}
