import { h } from "vue";
import { ElTag } from "element-plus";
import ReadTable from "@/components/ReadTable";
import { hasPermission } from "@/utils/permission";

export const pageButtons: TableButton[] = [
  {
    buttonName: "模板下载", //displayName:编辑
    buttonCode: "PickList.template", //itemName:PickList.edit
    buttonIcon: "download", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleTemplate", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "导入", //displayName:编辑
    buttonCode: "PickList.import", //itemName:MaterialList.edit
    buttonIcon: "import", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleImport", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "添加下采项", //displayName:编辑
    buttonCode: "PickList.add", //itemName:PickList.edit
    buttonIcon: "add", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleAdd", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "选择下采项", //displayName:编辑
    buttonCode: "PickList.select", //itemName:PickList.edit
    buttonIcon: "download", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleSelect", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "下采申请", //displayName:编辑
    buttonCode: "PickList.apply", //itemName:PickList.edit
    buttonIcon: "download", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleApply", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "查看", //displayName:编辑
    buttonCode: "PickList.query", //itemName:PickList.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleRead", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "添加配件", //displayName:编辑
    buttonCode: "PickList.add", //itemName:PickList.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handlePartsAdd", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "编辑", //displayName:编辑
    buttonCode: "PickList.edit", //itemName:PickList.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleEdit", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },

  {
    buttonName: "删除", //displayName:编辑
    buttonCode: "PickList.delete", //itemName:PickList.edit
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
        buttonCode: "", //itemName:PickList.edit
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
    span: 2,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "项目负责人",
    prop: "projectDutyStaffName",
    width: 120,
    align: "left",
    fixed: undefined,
    read: false,
    span: 2,
    isFormItem: false,
    showOverflowTooltip: true
  },
  {
    label: "中标单位",
    prop: "winBidCompanyName",
    width: 240,
    align: "left",
    fixed: undefined,
    read: false,
    span: 2,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "设备名称",
    prop: "materialName",
    width: 150,
    align: "left",
    fixed: undefined,
    read: false,
    span: 2,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "参数要求",
    prop: "materialParams",
    width: 150,
    align: "left",
    fixed: undefined,
    read: false,
    span: 2,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "规格型号",
    prop: "materialSpec",
    width: 150,
    align: "left",
    fixed: undefined,
    read: false,
    span: 2,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "单位",
    prop: "materialUnit",
    width: 100,
    align: "left",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "合计数量",
    prop: "materialQty",
    width: 100,
    align: "right",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ materialQty }) =>
      h(
        ElTag,
        {
          // type:
          //   materialQty > availableQty &&
          //   sellContractId != "00000000-0000-0000-0000-000000000000"
          //     ? "danger"
          //     : "info"
        },
        materialQty
      )
  },
  {
    label: "下采数量累计",
    prop: "approvedQty",
    width: 120,
    align: "right",
    fixed: undefined,
    read: false,
    isFormItem: false,
    showOverflowTooltip: true,
    tableColumnSlot: ({ approvedQty }) => h("span", approvedQty)
  },
  {
    label: "站点",
    prop: "siteItems",
    width: 160,
    align: "left",
    isFormItem: true,
    span: 2,
    showOverflowTooltip: true,
    tableColumnSlot: ({ siteItems }) =>
      h(ReadTable, {
        width: 623,
        height: 400,
        data: siteItems,
        columns: [
          {
            label: "站点名称",
            prop: "siteName",
            width: 150,
            align: "left",
            read: false,
            isFormItem: true,
            showOverflowTooltip: true
          },
          {
            label: "数量",
            prop: "materialQty",
            width: 100,
            align: "right",
            read: false,
            isFormItem: true,
            showOverflowTooltip: true
          },
          {
            label: "到货日期",
            prop: "receiveTime",
            width: 150,
            align: "left",
            read: false,
            isFormItem: true,
            showOverflowTooltip: true
          }
        ]
      })
  }
];
export const column2 = [
  {
    label: "备注",
    prop: "remark",
    width: 200,
    align: "left",
    fixed: undefined,
    read: false,
    span: 2,
    isFormItem: true,
    showOverflowTooltip: true
  }
];
