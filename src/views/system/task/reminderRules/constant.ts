import { h } from "vue";
import dayjs from "dayjs";
import { ElTag } from "element-plus";
import { hasPermission } from "@/utils/permission";

export const pageButtons: TableButton[] = [
  {
    buttonName: "添加", //displayName:编辑
    buttonCode: "ReminderRules.add", //itemName:ReminderRules.edit
    buttonIcon: "add", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleAdd", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  // {
  //   buttonName: "导出", //displayName:编辑
  //   buttonCode: "ReminderRules.export", //itemName:ReminderRules.edit
  //   buttonIcon: "export", //itemName:edit
  //   buttonType: "primary", //itemName:primary
  //   buttonClick: "handleExport", //itemName:handleEdit
  //   isTableColum: false, //itemName:false
  //   isLink: false, //itemName:false
  //   popconfirmTitle: "" //itemName:是否确认删除
  // },
  {
    buttonName: "查看", //displayName:编辑
    buttonCode: "ReminderRules.query", //itemName:ReminderRules.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleRead", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "编辑", //displayName:编辑
    buttonCode: "ReminderRules.edit", //itemName:ReminderRules.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleEdit", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "删除", //displayName:编辑
    buttonCode: "ReminderRules.delete", //itemName:ReminderRules.edit
    buttonIcon: "", //itemName:edit
    buttonType: "danger", //itemName:primary
    buttonClick: "handleDelete", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "是否确认删除" //itemName:是否确认删除
  }
];
console.log("pageButtons", pageButtons);

//有权限的按钮数组
export const hasPermissionPageButtons = pageButtons.filter(item =>
  hasPermission(item.buttonCode)
);
console.log("hasPermissionPageButtons", hasPermissionPageButtons);

//有权限的表格按钮数组
export const tableButtons = hasPermissionPageButtons.filter(
  item => !item.isTableColum
);
console.log("tableButtons", tableButtons);

//有权限的操作按钮数组
export const tableRowButtons = hasPermissionPageButtons.filter(
  item => item.isTableColum
);
console.log("tableRowButtons", tableRowButtons);

//包含更多按钮的有权限的操作按钮数组
export const operationButtons = function () {
  const buttons = [];
  tableRowButtons.forEach((element, index) => {
    if (index < 3) {
      buttons.push({ ...element });
    } else if (index == 3) {
      buttons.push({
        buttonName: "更多", //displayName:编辑
        buttonCode: "", //itemName:ReminderRules.edit
        buttonIcon: "more", //itemName:edit
        buttonType: "primary", //itemName:primary
        buttonClick: "", //itemName:handleEdit
        isTableColum: true, //itemName:false
        isLink: true, //itemName:false
        disabled: false, //itemName:false
        popconfirmTitle: "", //itemName:是否确认删除
        title: "更多", //itemName:false
        children: [{ ...element }]
      });
    } else {
      buttons[3].children.push({ ...element });
    }
  });
  return buttons;
};
const getNoticeMode = row => {
  let mode = "";
  if (row.isAppNotice) {
    mode += "APP";
    if (row.isWebNotice) {
      mode += "," + "网页";
      if (row.isMailNotice) {
        mode += "," + "邮箱";
        if (row.isMessageNotice) {
          mode += "," + "短信";
        }
      } else if (row.isMessageNotice) {
        mode += "," + "短信";
      }
    } else if (row.isMailNotice) {
      mode += "," + "邮箱";
      if (row.isMessageNotice) {
        mode += "," + "短信";
      }
    } else if (row.isMessageNotice) {
      mode += "," + "短信";
    }
  } else if (row.isMailNotice) {
    mode += "邮箱";
    if (row.isWebNotice) {
      mode += "," + "网页";
      if (row.isMessageNotice) {
        mode += "," + "短信";
      }
    } else if (row.isMessageNotice) {
      mode += "短信";
    }
  } else if (row.isWebNotice) {
    mode += "网页";
    if (row.isMessageNotice) {
      mode += "," + "短信";
    }
  } else if (row.isMessageNotice) {
    mode += "短信";
  }
  return mode;
};
export const columns = [
  {
    label: "业务名称",
    prop: "businessName",
    width: 200,
    align: "left",
    fixed: "left",
    read: false,
    span: 2,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "首次提醒时间",
    prop: "firstNoticeTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ firstNoticeTime, firstNoticeUnit }) => {
      return firstNoticeTime + firstNoticeUnit;
    }
  },
  // {
  //   label: "到期前提醒时间",
  //   prop: "beforeExpirationTime",
  //   width: 120,
  //   align: "left",
  //   read: false,
  //   isFormItem: true,
  //   showOverflowTooltip: true,
  //   formatter: ({ beforeExpirationTime, beforeExpirationUnit }) => {
  //     return beforeExpirationTime + beforeExpirationUnit;
  //   }
  // },
  {
    label: "间隔提醒周期",
    prop: "cycleNoticeTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ cycleNoticeTime, cycleNoticeUnit }) => {
      return cycleNoticeTime + cycleNoticeUnit;
    }
  },
  {
    label: "提醒时间段",
    prop: "noticeStartTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ noticeStartTime, noticeEndTime }) => {
      return noticeStartTime + "-" + noticeEndTime;
    }
  },
  {
    label: "提醒方式",
    prop: "isAppNotice",
    width: 200,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: row => h("span", getNoticeMode(row))
  },
  {
    label: "系统类提醒文案",
    prop: "noticeContent",
    width: 200,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "结果反馈文案",
    prop: "applicantNoticeContent",
    width: 200,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "审核提醒文案",
    prop: "auditorNoticeContent",
    width: 200,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "是否启用",
    prop: "isEnable",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ isEnable }) =>
      h(
        ElTag,
        {
          type: isEnable ? "success" : "info"
        },
        isEnable ? "是" : "否"
      )
  },
  {
    label: "最后执行时间",
    prop: "lastExecutionTime",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ lastExecutionTime }) => {
      return lastExecutionTime && lastExecutionTime != "1900-01-01 00:00"
        ? dayjs(lastExecutionTime).format("YYYY-MM-DD HH:mm")
        : "---";
    }
  },
  {
    label: "备注",
    prop: "remark",
    width: 200,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  }
];
