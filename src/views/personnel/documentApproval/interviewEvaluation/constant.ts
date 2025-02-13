import dayjs from "dayjs";
import { hasPermission } from "@/utils/permission";
export const pageButtons: TableButton[] = [
  {
    buttonName: "申请", //displayName:编辑
    buttonCode: "InterviewEvaluation.apply", //itemName:InterviewEvaluation.edit
    buttonIcon: "add", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleAdd", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  // {
  //   buttonName: "导出", //displayName:编辑
  //   buttonCode: "InterviewEvaluation.export", //itemName:InterviewEvaluation.edit
  //   buttonIcon: "export", //itemName:edit
  //   buttonType: "primary", //itemName:primary
  //   buttonClick: "handleExport", //itemName:handleEdit
  //   isTableColum: false, //itemName:false
  //   isLink: false, //itemName:false
  //   popconfirmTitle: "" //itemName:是否确认删除
  // },

  {
    buttonName: "查看", //displayName:编辑
    buttonCode: "InterviewEvaluation.query", //itemName:InterviewEvaluation.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleRead", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "审核", //displayName:编辑
    buttonCode: "InterviewEvaluation.audit", //itemName:InterviewEvaluation.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleAudit", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "导出", //displayName:编辑
    buttonCode: "InterviewEvaluation.exportOne", //itemName:StorageGoods.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleExportOne", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "编辑", //displayName:编辑
    buttonCode: "InterviewEvaluation.edit", //itemName:InterviewEvaluation.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleEdit", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "删除", //displayName:编辑
    buttonCode: "InterviewEvaluation.delete", //itemName:InterviewEvaluation.edit
    buttonIcon: "", //itemName:edit
    buttonType: "danger", //itemName:primary
    buttonClick: "handleDelete", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "是否确认删除" //itemName:是否确认删除
  },
  {
    buttonName: "隐藏", //displayName:编辑
    buttonCode: "InterviewEvaluation.hidden", //itemName:TodoList.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleHidden", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "确定要隐藏吗" //itemName:是否确认删除
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
        buttonCode: "", //itemName:InterviewEvaluation.edit
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
    label: "应聘人员",
    prop: "candidate",
    width: 150,
    align: "left",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "应聘方式/推荐",
    prop: "ayMethod",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "应聘部门",
    prop: "ayDeptName",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "应聘职位",
    prop: "ayPost",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "入职日期",
    prop: "hireDate",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ hireDate }) => {
      return hireDate ? dayjs(hireDate).format("YYYY-MM-DD") : "-";
    }
  },
  {
    label: "试用薪资(元)",
    prop: "probationSalary",
    width: 140,
    align: "right",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "转正薪资(元)",
    prop: "salary",
    width: 140,
    align: "right",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "试用期",
    prop: "probationPeriod",
    width: 100,
    align: "right",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },

  {
    label: "社保及公积金缴纳基数",
    prop: "socialSecurityBase",
    width: 180,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  }
];
