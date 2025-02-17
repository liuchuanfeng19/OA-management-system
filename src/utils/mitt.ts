import type { Emitter } from "mitt";
import mitt from "mitt";

type Events = {
  resize: {
    detail: {
      width: number;
      height: number;
    };
  };
  openPanel: string;
  tagViewsChange: string;
  tagViewsShowModel: string;
  logoChange: boolean;
  changLayoutRoute: {
    indexPath: string;
    parentPath: string;
  };
  closeTag: {
    routeName: string;
    query: object;
    targetPath?: string;
  };
  reloadStaffNoticeData: {};
  onNoticeDataEmitter: string;
  onAuditStatusEmitter: Array<string>;
};

export const emitter: Emitter<Events> = mitt<Events>();
