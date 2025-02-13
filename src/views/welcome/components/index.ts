import workCompletion from "./WorkCompletion.vue";
import fileDownload from "./FileDownload.vue";
import attendance from "./Attendance.vue";
import reInfinite from "./Infinite.vue";
import shortcuts from "./Shortcuts.vue";
import dynamics from "./Dynamics.vue";
import textList from "./TextList.vue";
import reGithub from "./Github.vue";
import reLine from "./Line.vue";
import reBar from "./Bar.vue";
import rePie from "./Pie.vue";
import type { App } from "vue";

const WorkCompletion = Object.assign(workCompletion, {
  install(app: App) {
    app.component(workCompletion.name, workCompletion);
  }
});

const FileDownload = Object.assign(fileDownload, {
  install(app: App) {
    app.component(fileDownload.name, fileDownload);
  }
});

const Attendance = Object.assign(attendance, {
  install(app: App) {
    app.component(attendance.name, attendance);
  }
});

const ReInfinite = Object.assign(reInfinite, {
  install(app: App) {
    app.component(reInfinite.name, reInfinite);
  }
});

const Shortcuts = Object.assign(shortcuts, {
  install(app: App) {
    app.component(shortcuts.name, shortcuts);
  }
});

const Dynamics = Object.assign(dynamics, {
  install(app: App) {
    app.component(dynamics.name, dynamics);
  }
});

const TextList = Object.assign(textList, {
  install(app: App) {
    app.component(textList.name, textList);
  }
});

const ReGithub = Object.assign(reGithub, {
  install(app: App) {
    app.component(reGithub.name, reGithub);
  }
});

const ReLine = Object.assign(reLine, {
  install(app: App) {
    app.component(reLine.name, reLine);
  }
});

const ReBar = Object.assign(reBar, {
  install(app: App) {
    app.component(reBar.name, reBar);
  }
});

const RePie = Object.assign(rePie, {
  install(app: App) {
    app.component(rePie.name, rePie);
  }
});

export {
  WorkCompletion,
  FileDownload,
  Attendance,
  ReInfinite,
  Shortcuts,
  Dynamics,
  TextList,
  ReGithub,
  ReLine,
  ReBar,
  RePie
};
