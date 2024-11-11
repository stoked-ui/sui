import { DetailDataAction } from "./Detail.types";
import { DetailTypeProps } from "./DetailView.types";


export interface DetailActionProps extends DetailTypeProps {
  data: DetailDataAction;
}
