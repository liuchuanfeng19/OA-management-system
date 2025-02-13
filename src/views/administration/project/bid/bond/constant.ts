import { h } from "vue";
import dayjs from "dayjs";
import { ElTag } from "element-plus";
import { hasPermission } from "@/utils/permission";
import PreviewButton from "@/components/PreviewButton";
import DownloadButton from "@/components/DownloadButton";

export const pageButtons: TableButton[] = [
  {
    buttonName: "申请", //displayName:编辑
    buttonCode: "Bond.add", //itemName:Bond.edit
    buttonIcon: "add", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleAdd", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "导出", //displayName:编辑
    buttonCode: "Bond.export", //itemName:Bond.edit
    buttonIcon: "export", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleExport", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },

  {
    buttonName: "查看", //displayName:编辑
    buttonCode: "Bond.query", //itemName:Bond.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleRead", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "编辑", //displayName:编辑
    buttonCode: "Bond.edit", //itemName:Bond.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleEdit", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },

  {
    buttonName: "审核", //displayName:编辑
    buttonCode: "Bond.audit", //itemName:Bond.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleApproval", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "底单上传", //displayName:编辑
    buttonCode: "Bond.upload", //itemName:Prove.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleUpload", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  // {
  //   buttonName: "退回日期", //displayName:编辑
  //   buttonCode: "Bond.return", //itemName:Prove.edit
  //   buttonIcon: "", //itemName:edit
  //   buttonType: "primary", //itemName:primary
  //   buttonClick: "handleReturn", //itemName:handleEdit
  //   isTableColum: true, //itemName:false
  //   isLink: true, //itemName:false
  //   popconfirmTitle: "" //itemName:是否确认删除
  // },
  // {
  //   buttonName: "办理状态", //displayName:编辑
  //   buttonCode: "Bond.process", //itemName:Prove.edit
  //   buttonIcon: "", //itemName:edit
  //   buttonType: "primary", //itemName:primary
  //   buttonClick: "handleProcess", //itemName:handleEdit
  //   isTableColum: true, //itemName:false
  //   isLink: true, //itemName:false
  //   popconfirmTitle: "" //itemName:是否确认删除
  // },

  {
    buttonName: "打印", //displayName:编辑
    buttonCode: "Bond.print", //itemName:Prove.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handlePrint", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "批量打印", //displayName:编辑
    buttonCode: "Bond.print", //itemName:Prove.edit
    buttonIcon: "download", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handlePrint", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  }
  // {
  //   buttonName: "删除", //displayName:编辑
  //   buttonCode: "Bond.delete", //itemName:Bond.edit
  //   buttonIcon: "", //itemName:edit
  //   buttonType: "primary", //itemName:primary
  //   buttonClick: "handleDelete", //itemName:handleEdit
  //   isTableColum: true, //itemName:false
  //   isLink: true, //itemName:false
  //   popconfirmTitle: "是否确认删除" //itemName:是否确认删除
  // }
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
        buttonCode: "", //itemName:Bond.edit
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
export const columns = [
  {
    label: "项目名称",
    prop: "projectFullName",
    width: 300,
    align: "left",
    fixed: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "收款单位",
    prop: "inCompany",
    width: 300,
    align: "left",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "收款账户",
    prop: "collectAccount",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "开户行",
    prop: "openBank",
    width: 200,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "支出类型",
    prop: "payMethod",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "支出金额",
    prop: "payAmount",
    width: 100,
    align: "right",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "最晚付款日期",
    prop: "latestPayDate",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ latestPayDate }) => {
      return latestPayDate ? dayjs(latestPayDate).format("YYYY-MM-DD") : "-";
    }
  },
  {
    label: "领款人",
    prop: "drawStaff",
    width: 80,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "经办人",
    prop: "handStaff",
    width: 80,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "紧急类型",
    prop: "emergencyType",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ emergencyType }) =>
      h(
        ElTag,
        { type: emergencyType == "紧急" ? "danger" : "info" },
        emergencyType
      )
  },
  {
    label: "申请日期",
    prop: "applyTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: false,
    showOverflowTooltip: true,
    formatter: ({ applyTime }) => {
      return applyTime ? dayjs(applyTime).format("YYYY-MM-DD") : "-";
    }
  },
  {
    label: "退回日期",
    prop: "returnTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: false,
    showOverflowTooltip: true,
    formatter: ({ returnTime }) => {
      return returnTime ? dayjs(returnTime).format("YYYY-MM-DD") : "-";
    }
  },
  {
    label: "办理状态",
    prop: "processTypeName",
    width: 100,
    align: "left",
    read: false,
    isFormItem: false,
    showOverflowTooltip: true
  },
  {
    label: "审核状态",
    prop: "applyStatusExpr",
    width: 100,
    align: "left",
    read: false,
    isFormItem: false,
    showOverflowTooltip: true
  },
  {
    label: "备注",
    prop: "applyReason",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "底单附件",
    prop: "attach",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ attach }) =>
      h(
        "div",
        attach.length > 0
          ? [
              h(PreviewButton, { srcList: [attach] }),
              h(DownloadButton, { srcList: [attach] })
            ]
          : []
      )
  }
  // {
  //   label: "创建时间",
  //   prop: "createTime",
  //   width: 120,
  //   align: "left",
  //   read: false,
  //   isFormItem: true,
  //   showOverflowTooltip: true,
  //   formatter: ({ createTime }) => {
  //     return dayjs(createTime).format("YYYY-MM-DD");
  //   }
  // }
];
