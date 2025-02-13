import { h } from "vue";
import dayjs from "dayjs";
import { hasPermission } from "@/utils/permission";
export const pageButtons: TableButton[] = [
  {
    buttonName: "添加", //displayName:编辑
    buttonCode: "QualificationsList.add", //itemName:QualificationsList.edit
    buttonIcon: "add", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleAdd", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "导出", //displayName:编辑
    buttonCode: "QualificationsList.export", //itemName:QualificationsList.edit
    buttonIcon: "export", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleExport", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },

  {
    buttonName: "查看", //displayName:编辑
    buttonCode: "QualificationsList.query", //itemName:QualificationsList.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleQuery", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },

  // {
  //   buttonName: "预览", //displayName:编辑
  //   buttonCode: "QualificationsList.preview", //itemName:QualificationsList.edit
  //   buttonIcon: "", //itemName:edit
  //   buttonType: "primary", //itemName:primary
  //   buttonClick: "handleDown", //itemName:handleEdit
  //   isTableColum: true, //itemName:false
  //   isLink: true, //itemName:false
  //   popconfirmTitle: "" //itemName:是否确认删除
  // },
  {
    buttonName: "编辑", //displayName:编辑
    buttonCode: "QualificationsList.edit", //itemName:QualificationsList.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleEdit", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "删除", //displayName:编辑
    buttonCode: "QualificationsList.delete", //itemName:QualificationsList.edit
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
        buttonCode: "", //itemName:QualificationsList.edit
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
    label: "公司名称",
    prop: "companyName",
    width: 180,
    align: "left",
    fixed: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },

  {
    label: "证书类别",
    prop: "qualiTypeName",
    width: 100,
    align: "left",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "证书名称",
    prop: "certName",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "证书编号",
    prop: "certNo",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },

  {
    label: "颁发日期",
    prop: "startTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ startTime }) => {
      return startTime ? dayjs(startTime).format("YYYY-MM-DD") : "-";
    }
  },
  {
    label: "有效日期",
    prop: "endTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ endTime }) => {
      return endTime ? dayjs(endTime).format("YYYY-MM-DD") : "-";
    }
  },
  {
    label: "年检日期",
    prop: "annualTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ annualTime }) => {
      return annualTime ? dayjs(annualTime).format("YYYY-MM-DD") : "-";
    }
  },
  {
    label: "是否有效",
    prop: "isExpired",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ isExpired }) => h("span", isExpired ? "失效" : "有效")
  },
  {
    label: "发证机构",
    prop: "issuingUnit",
    width: 200,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ issuingUnit }) =>
      h("span", issuingUnit ? issuingUnit : "-")
  }
];
