import { h } from "vue";
import PreviewButton from "@/components/PreviewButton";
import DownloadButton from "@/components/DownloadButton";
import { hasPermission } from "@/utils/permission";
export const pageButtons: TableButton[] = [
  {
    buttonName: "导入", //displayName:编辑
    buttonCode: "MaterialList.import", //itemName:MaterialList.edit
    buttonIcon: "import", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleAdd", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "模板下载", //按钮名称
    buttonCode: "MaterialList.template", //按钮对应的权限编码
    buttonIcon: "download", //按钮图标
    buttonType: "primary", //按钮样式
    buttonClick: "handleTemplate", //按钮点击事件
    isTableColum: false, //是否是表格里面的按钮
    isLink: false, //是否是链接
    popconfirmTitle: "" //点击按钮时的提示文字
  },
  {
    buttonName: "导出", //displayName:编辑
    buttonCode: "MaterialList.export", //itemName:MaterialList.edit
    buttonIcon: "export", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleExport", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "查看", //displayName:编辑
    buttonCode: "MaterialList.query", //itemName:MaterialList.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleRead", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "编辑", //displayName:编辑
    buttonCode: "MaterialList.edit", //itemName:MaterialList.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleEdit", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },

  {
    buttonName: "绑定", //displayName:编辑
    buttonCode: "MaterialList.bind", //itemName:MaterialList.edit
    buttonIcon: "menu", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleBind", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "明细", //displayName:编辑
    buttonCode: "MaterialList.query", //itemName:MaterialList.edit
    buttonIcon: "menu", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleDetail", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "删除", //displayName:编辑
    buttonCode: "MaterialList.delete", //itemName:MaterialList.edit
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
        buttonCode: "", //itemName:MaterialList.edit
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
    width: 150,
    align: "left",
    fixed: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "项目简称",
    prop: "projectShortName",
    width: 150,
    align: "left",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "合同编号",
    prop: "sellContractCode",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "合同类型",
    prop: "sellContractTypeName",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "附件",
    prop: "attachWzhtqd",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ attachWzhtqd }) =>
      h(
        "div",
        attachWzhtqd.length > 0
          ? [
              h(PreviewButton, { srcList: attachWzhtqd }),
              h(DownloadButton, { srcList: attachWzhtqd })
            ]
          : []
      )
  }
];
