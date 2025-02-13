import { h } from "vue";
import dayjs from "dayjs";
import { hasPermission } from "@/utils/permission";
import PreviewButton from "@/components/PreviewButton";
import DownloadButton from "@/components/DownloadButton";

export const pageButtons: TableButton[] = [
  {
    buttonName: "添加", //displayName:编辑
    buttonCode: "VehicleList.apply", //itemName:VehicleList.edit
    buttonIcon: "add", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleAdd", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },

  {
    buttonName: "查看", //displayName:编辑
    buttonCode: "VehicleList.query", //itemName:VehicleList.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleQuery", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },

  {
    buttonName: "编辑", //displayName:编辑
    buttonCode: "VehicleList.edit", //itemName:VehicleList.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleEdit", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "删除", //displayName:编辑
    buttonCode: "VehicleList.delete", //itemName:VehicleList.edit
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
        buttonCode: "", //itemName:VehicleList.edit
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
    label: "车辆名称",
    prop: "carName",
    width: 150,
    align: "left",
    fixed: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "车辆牌照",
    prop: "carLicensePlate",
    width: 120,
    align: "left",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "车辆型号",
    prop: "carType",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "车辆品牌",
    prop: "carBrand",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "行驶证编号",
    prop: "carLicenceDocNo",
    width: 180,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "车辆颜色",
    prop: "carColor",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "发证机关",
    prop: "carLicenseUnit",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "车位号",
    prop: "carStall",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "上次保养时间",
    prop: "carPreMaintainDate",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ carPreMaintainDate }) => {
      return carPreMaintainDate
        ? dayjs(carPreMaintainDate).format("YYYY-MM-DD")
        : "-";
    }
  },
  {
    label: "上次保养内容",
    prop: "carPreMaintainDateContent",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "下次保养时间",
    prop: "carNextMaintainDate",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ carNextMaintainDate }) => {
      return carNextMaintainDate
        ? dayjs(carNextMaintainDate).format("YYYY-MM-DD")
        : "-";
    }
  },
  {
    label: "投保公司",
    prop: "carInsurance",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "投保时间",
    prop: "carInsuranceDate",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ carInsuranceDate }) => {
      return carInsuranceDate
        ? dayjs(carInsuranceDate).format("YYYY-MM-DD")
        : "-";
    }
  },
  {
    label: "上次年检",
    prop: "carPreAnnualSurveyDate",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ carPreAnnualSurveyDate }) => {
      return carPreAnnualSurveyDate
        ? dayjs(carPreAnnualSurveyDate).format("YYYY-MM-DD")
        : "-";
    }
  },
  {
    label: "下次年检",
    prop: "carNextAnnualSurveyDate",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ carNextAnnualSurveyDate }) => {
      return carNextAnnualSurveyDate
        ? dayjs(carNextAnnualSurveyDate).format("YYYY-MM-DD")
        : "-";
    }
  },
  {
    label: "驾驶员",
    prop: "userName",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "车辆状态",
    prop: "carStatusExpr",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "车辆购买时间",
    prop: "carBuyDate",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ carBuyDate }) => {
      return carBuyDate ? dayjs(carBuyDate).format("YYYY-MM-DD") : "-";
    }
  },
  {
    label: "类型",
    prop: "carForm",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ carForm }) =>
      h("div", carForm == 1 ? "专车" : carForm == 0 ? "公车" : "")
  },
  {
    label: "驾驶员",
    prop: "userName",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    condition: ({ carForm }) => carForm == 1
  },
  {
    label: "驾驶员手机号",
    prop: "userMobile",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    condition: ({ carForm }) => carForm == 1
  },
  {
    label: "车辆照片",
    prop: "carImage",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ carImage }) =>
      h(
        "div",
        carImage.length > 0
          ? [
              h(PreviewButton, { srcList: carImage }),
              h(DownloadButton, { srcList: carImage })
            ]
          : []
      )
  }
];
