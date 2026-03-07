/**
 * SST global type stubs for standalone tsc.
 * When running inside SST, these are provided by .sst/platform/config.d.ts.
 * This file allows `tsc --noEmit` to pass outside the SST runtime.
 */

declare namespace sst {
  namespace aws {
    class ApiGatewayV2 {
      constructor(name: string, args?: any);
      route(path: string, handler: any): void;
    }
    class StaticSite {
      constructor(name: string, args?: any);
    }
    class Nextjs {
      constructor(name: string, args?: any);
    }
    class Function {
      constructor(name: string, args?: any);
      readonly arn: string;
    }
    function dns(args: { zone: string }): any;
  }
  class Secret {
    constructor(name: string, defaultValue?: string);
    readonly value: string;
  }
}

declare const $dev: boolean;
declare const $app: { name: string; stage: string; removal: string; providers: any; protect: boolean };
