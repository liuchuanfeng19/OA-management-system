import dayjs from "dayjs";
import { hasPermission } from "@/utils/permission";
export const pageButtons: TableButton[] = [
  // {
  //   buttonName: "添加", //displayName:编辑
  //   buttonCode: "ProVehicle.add", //itemName:ProVehicle.edit
  //   buttonIcon: "add", //itemName:edit
  //   buttonType: "primary", //itemName:primary
  //   buttonClick: "handleAdd", //itemName:handleEdit
  //   isTableColum: false, //itemName:false
  //   isLink: false, //itemName:false
  //   popconfirmTitle: "" //itemName:是否确认删除
  // },
  // {
  //   buttonName: "导出", //displayName:编辑
  //   buttonCode: "ProVehicle.export", //itemName:ProVehicle.edit
  //   buttonIcon: "export", //itemName:edit
  //   buttonType: "primary", //itemName:primary
  //   buttonClick: "handleExport", //itemName:handleEdit
  //   isTableColum: false, //itemName:false
  //   isLink: false, //itemName:false
  //   popconfirmTitle: "" //itemName:是否确认删除
  // },
  // {
  //   buttonName: "批量下载", //displayName:编辑
  //   buttonCode: "ProVehicle.moreDownload", //itemName:ProVehicle.edit
  //   buttonIcon: "download", //itemName:edit
  //   buttonType: "primary", //itemName:primary
  //   buttonClick: "handleMoreDownload", //itemName:handleEdit
  //   isTableColum: false, //itemName:false
  //   isLink: false, //itemName:false
  //   popconfirmTitle: "" //itemName:是否确认删除
  // },
  {
    buttonName: "查看", //displayName:编辑
    buttonCode: "ProVehicle.query", //itemName:ProVehicle.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleRead", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  }
  // {
  //   buttonName: "编辑", //displayName:编辑
  //   buttonCode: "ProVehicle.edit", //itemName:ProVehicle.edit
  //   buttonIcon: "", //itemName:edit
  //   buttonType: "primary", //itemName:primary
  //   buttonClick: "handleEdit", //itemName:handleEdit
  //   isTableColum: true, //itemName:false
  //   isLink: true, //itemName:false
  //   popconfirmTitle: "" //itemName:是否确认删除
  // },
  // {
  //   buttonName: "删除", //displayName:编辑
  //   buttonCode: "ProVehicle.delete", //itemName:ProVehicle.edit
  //   buttonIcon: "", //itemName:edit
  //   buttonType: "danger", //itemName:primary
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
        buttonCode: "", //itemName:ProVehicle.edit
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
    prop: "projectName",
    width: 120,
    align: "left",
    fixed: "left",
    read: false,
    span: 2,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "项目负责人",
    prop: "projectDuty",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "负责人电话",
    prop: "projectDutyMobile",
    width: 130,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "姓名",
    prop: "staffName",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "车辆名称",
    prop: "carName",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "车牌号",
    prop: "carLicensePlate",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "申请人",
    prop: "staffName",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "申请人电话",
    prop: "mobile",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "借车时间",
    prop: "planPickTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ planPickTime }) => {
      return planPickTime ? dayjs(planPickTime).format("YYYY-MM-DD") : "-";
    }
  },
  {
    label: "预计归还时间",
    prop: "planReturnTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ planReturnTime }) => {
      return planReturnTime ? dayjs(planReturnTime).format("YYYY-MM-DD") : "-";
    }
  }
];
