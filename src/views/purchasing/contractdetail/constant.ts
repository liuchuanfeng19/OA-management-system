import dayjs from "dayjs";
import { h } from "vue";
import ReadTable from "@/components/ReadTable";
import { hasPermission } from "@/utils/permission";
export const pageButtons: TableButton[] = [
  {
    buttonName: "添加下采项", //displayName:编辑
    buttonCode: "ContractDetail.add", //itemName:PickList.edit
    buttonIcon: "add", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handlePickAdd", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "生成采购清单", //displayName:编辑
    buttonCode: "ContractDetail.add", //itemName:PickList.edit
    buttonIcon: "add", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleAdd", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "导出", //displayName:编辑
    buttonCode: "ContractDetail.export", //itemName:PickList.edit
    buttonIcon: "export", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleExport", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "导入", //displayName:编辑
    buttonCode: "ContractDetail.import", //itemName:PickList.edit
    buttonIcon: "import", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleImport", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "查看", //displayName:编辑
    buttonCode: "ContractDetail.query", //itemName:PickList.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleRead", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "添加配件", //displayName:编辑
    buttonCode: "ContractDetail.partsAdd", //itemName:PickList.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handlePartsAdd", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "编辑", //displayName:编辑
    buttonCode: "ContractDetail.edit", //itemName:PickList.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleEdit", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "退回", //displayName:编辑
    buttonCode: "ContractDetail.return", //itemName:PickList.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleReturn", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "是否确认退回" //itemName:是否确认删除
  },
  {
    buttonName: "删除", //displayName:编辑
    buttonCode: "ContractDetail.delete", //itemName:PickList.edit
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
    width: 150,
    align: "left",
    read: true,
    isFormItem: true,
    span: 2,
    showOverflowTooltip: true
  },
  {
    label: "项目负责人",
    prop: "projectDutyStaffName",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true
  },
  {
    label: "中标单位",
    prop: "winBidCompanyName",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true
  },
  {
    label: "设备名称",
    prop: "materialName",
    width: 150,
    align: "left",
    read: false,
    span: 1,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "品牌",
    prop: "materialBrand",
    width: 150,
    align: "left",
    read: false,
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
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true
  },
  {
    label: "采购单价",
    prop: "materialPrice",
    width: 150,
    align: "right",
    read: false,
    span: 1,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "收货地址",
    prop: "recvAddress",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    span: 2,
    showOverflowTooltip: true
  },
  {
    label: "收货人",
    prop: "recvName",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true
  },
  {
    label: "电话",
    prop: "recvMobile",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true
  },
  {
    label: "备注",
    prop: "remark",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    span: 2,
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
            label: "数量",
            prop: "materialQty",
            width: 150,
            align: "right",
            read: true,
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
            showOverflowTooltip: true,
            formatter: ({ receiveTime }) => {
              return receiveTime
                ? dayjs(receiveTime).format("YYYY-MM-DD")
                : "-";
            }
          }
        ],
        data: siteItems
      })
  },
  {
    label: "数量",
    prop: "materialQty",
    width: 150,
    align: "right",
    read: false,
    isFormItem: true,
    span: 2,
    showOverflowTooltip: true
  }
];
