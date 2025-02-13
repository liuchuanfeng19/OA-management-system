import { h } from "vue";
import dayjs from "dayjs";
import { hasPermission } from "@/utils/permission";
import PreviewButton from "@/components/PreviewButton";
import DownloadButton from "@/components/DownloadButton";

export const pageButtons: TableButton[] = [
  {
    buttonName: "申请", //displayName:编辑
    buttonCode: "ProjectCountersigning.apply", //itemName:LeaveManage.edit
    buttonIcon: "add", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleApply", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "查看", //displayName:编辑
    buttonCode: "ProjectCountersigning.query", //itemName:LeaveManage.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleQuery", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "编辑", //displayName:编辑
    buttonCode: "ProjectCountersigning.edit", //itemName:LeaveManage.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleEdit", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "审批", //displayName:编辑
    buttonCode: "ProjectCountersigning.audit", //itemName:LeaveManage.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleApproval", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },

  {
    buttonName: "删除", //displayName:编辑
    buttonCode: "ProjectCountersigning.delete", //itemName:LeaveManage.edit
    buttonIcon: "", //itemName:edit
    buttonType: "danger", //itemName:primary
    buttonClick: "handleDelete", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
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
        buttonCode: "", //itemName:LeaveManage.edit
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
    label: "合同摘要",
    prop: "title",
    width: 200,
    align: "left",
    fixed: "left",
    read: false,
    span: 4,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "是否含税",
    prop: "hasTax",
    width: 120,
    align: "left",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ hasTax }) => h("span", hasTax ? "是" : "否")
  },
  {
    label: "数量",
    prop: "qty",
    width: 90,
    align: "right",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "合同价款及付款方式",
    prop: "amount",
    width: 200,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ amount, payMethod }) => {
      return amount + "-" + payMethod;
    }
  },
  {
    label: "甲方单位",
    prop: "firstOrg",
    width: 180,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "买方合同编号",
    prop: "firstCode",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "乙方单位",
    prop: "secondOrg",
    width: 180,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "卖方合同编号",
    prop: "secondCode",
    width: 150,
    align: "letf",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "供方单位资信材料",
    prop: "stuff",
    width: 140,
    align: "letf",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ stuff }) =>
      h(
        "div",
        stuff.length > 0
          ? [
              h(PreviewButton, { srcList: [stuff] }),
              h(DownloadButton, { srcList: [stuff] })
            ]
          : []
      )
  },
  {
    label: "实施地点",
    prop: "place",
    width: 110,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "承办部门",
    prop: "doDeptName",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "承办人",
    prop: "doStaff",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "项目负责人",
    prop: "projectDuty",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "申请状态",
    prop: "applyStatusExpr",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "申请时间",
    prop: "applyTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ applyTime }) => {
      return applyTime ? dayjs(applyTime).format("YYYY-MM-DD") : "-";
    }
  }
];
