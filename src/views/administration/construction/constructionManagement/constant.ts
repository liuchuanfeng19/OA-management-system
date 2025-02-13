import { h } from "vue";
import ReadTable from "@/components/ReadTable";
import { hasPermission } from "@/utils/permission";
export const pageButtons: TableButton[] = [
  // {
  //   buttonName: "添加", //按钮名称
  //   buttonCode: "test.add", //按钮对应的权限编码
  //   buttonIcon: "", //按钮图标
  //   buttonType: "primary", //按钮样式
  //   buttonClick: "handleAdd", //按钮点击事件
  //   isTableColum: true, //是否是表格里面的按钮
  //   isLink: true, //是否是链接
  //   popconfirmTitle: "" //点击按钮时的提示文字
  // },
  // {
  //   buttonName: "导出", //按钮名称
  //   buttonCode: "test.export", //按钮对应的权限编码
  //   buttonIcon: "", //按钮图标
  //   buttonType: "primary", //按钮样式
  //   buttonClick: "handleExport", //按钮点击事件
  //   isTableColum: true, //是否是表格里面的按钮
  //   isLink: true, //是否是链接
  //   popconfirmTitle: "" //点击按钮时的提示文字
  // },
  {
    buttonName: "查看", //按钮名称
    buttonCode: "ConstructionManagement.query", //按钮对应的权限编码
    buttonIcon: "", //按钮图标
    buttonType: "primary", //按钮样式
    buttonClick: "handleRead", //按钮点击事件
    isTableColum: true, //是否是表格里面的按钮
    isLink: true, //是否是链接
    popconfirmTitle: "" //点击按钮时的提示文字
  },
  {
    buttonName: "编辑", //按钮名称
    buttonCode: "ConstructionManagement.edit", //按钮对应的权限编码
    buttonIcon: "", //按钮图标
    buttonType: "primary", //按钮样式
    buttonClick: "handleEdit", //按钮点击事件
    isTableColum: true, //是否是表格里面的按钮
    isLink: true, //是否是链接
    popconfirmTitle: "" //点击按钮时的提示文字
  }
];
//有权限的按钮数组
export const hasPermissionPageButtons = pageButtons.filter(item =>
  hasPermission(item.buttonCode)
);
//有权限的表格按钮数组
export const tableButtons = hasPermissionPageButtons.filter(
  item => !item.isTableColum
);
//有权限的操作按钮数组
export const tableRowButtons = hasPermissionPageButtons.filter(
  item => item.isTableColum
);
//包含更多按钮的有权限的操作按钮数组
export const operationButtons = function () {
  const buttons = [];
  tableRowButtons.forEach((element, index) => {
    if (index < 3) {
      buttons.push({ ...element });
    } else if (index == 3) {
      buttons.push({
        buttonName: "更多",
        buttonCode: "",
        buttonIcon: "more",
        buttonType: "primary",
        buttonClick: "",
        isTableColum: true,
        isLink: true,
        disabled: false,
        popconfirmTitle: "",
        title: "更多",
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
    label: "物资名称",
    prop: "materialName",
    width: 150,
    align: "left",
    read: true,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true
  },
  {
    label: "规格型号",
    prop: "materialSpec",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true
  },
  {
    label: "参数要求",
    prop: "materialParams",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true
  },
  {
    label: "单位",
    prop: "materialUnit",
    width: 150,
    align: "left",
    read: false,
    span: 1,
    isFormItem: true,
    showOverflowTooltip: true
  },

  {
    label: "站点",
    prop: "siteItems",
    width: 160,
    align: "right",
    isFormItem: true,
    span: 2,
    showOverflowTooltip: true,
    tableColumnSlot: ({ siteItems }) =>
      h(ReadTable, {
        width: 775,
        height: 400,
        columns: [
          {
            label: "站点名称",
            prop: "siteName",
            width: 150,
            align: "left",
            read: true,
            isFormItem: true,
            showOverflowTooltip: true
          },
          {
            label: "数量",
            prop: "drawingQty",
            width: 100,
            align: "right",
            read: true,
            isFormItem: true,
            showOverflowTooltip: true
          }
        ],
        data: siteItems
      })
  },
  {
    label: "总数量",
    prop: "drawingQty",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    span: 2,
    showOverflowTooltip: true
  }
];
