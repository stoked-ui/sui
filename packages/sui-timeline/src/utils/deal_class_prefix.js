import { prefixNames } from "framework-utils";
import { PREFIX } from "../interface/const";
export function prefix(...classNames) {
    return prefixNames(`${PREFIX}-`, ...classNames);
}
//# sourceMappingURL=deal_class_prefix.js.map