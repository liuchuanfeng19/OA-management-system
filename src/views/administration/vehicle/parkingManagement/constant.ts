import { h } from "vue";
import dayjs from "dayjs";
import { hasPermission } from "@/utils/permission";
import PreviewButton from "@/components/PreviewButton";
import DownloadButton from "@/components/DownloadButton";

export const pageButtons: TableButton[] = [
  {
    buttonName: "添加", //按钮名称
    buttonCode: "ParkingManagement.add", //按钮对应的权限编码
    buttonIcon: "add", //按钮图标
    buttonType: "primary", //按钮样式
    buttonClick: "handleAdd", //按钮点击事件
    isTableColum: false, //是否是表格里面的按钮
    isLink: false, //是否是链接
    popconfirmTitle: "" //点击按钮时的提示文字
  },
  // {
  //   buttonName: "导出", //按钮名称
  //   buttonCode: "ParkingManagement.export", //按钮对应的权限编码
  //   buttonIcon: "", //按钮图标
  //   buttonType: "primary", //按钮样式
  //   buttonClick: "handleExport", //按钮点击事件
  //   isTableColum: true, //是否是表格里面的按钮
  //   isLink: true, //是否是链接
  //   popconfirmTitle: "" //点击按钮时的提示文字
  // },
  {
    buttonName: "查看", //按钮名称
    buttonCode: "ParkingManagement.query", //按钮对应的权限编码
    buttonIcon: "", //按钮图标
    buttonType: "primary", //按钮样式
    buttonClick: "handleRead", //按钮点击事件
    isTableColum: true, //是否是表格里面的按钮
    isLink: true, //是否是链接
    popconfirmTitle: "" //点击按钮时的提示文字
  },
  {
    buttonName: "编辑", //按钮名称
    buttonCode: "ParkingManagement.edit", //按钮对应的权限编码
    buttonIcon: "", //按钮图标
    buttonType: "primary", //按钮样式
    buttonClick: "handleEdit", //按钮点击事件
    isTableColum: true, //是否是表格里面的按钮
    isLink: true, //是否是链接
    popconfirmTitle: "" //点击按钮时的提示文字
  },
  {
    buttonName: "删除", //按钮名称
    buttonCode: "ParkingManagement.delete", //按钮对应的权限编码
    buttonIcon: "", //按钮图标
    buttonType: "danger", //按钮样式
    buttonClick: "handleDelete", //按钮点击事件
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
    label: "公司名称",
    prop: "companyName",
    width: 120,
    align: "left",
    fixed: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "部门",
    prop: "deptName",
    width: 120,
    align: "left",
    fixed: undefined,
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
    label: "车位号",
    prop: "parkingSpaceNumber",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "车牌号",
    prop: "carNumber",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "租赁开始时间",
    prop: "startDate",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ startDate }) => {
      return startDate ? dayjs(startDate).format("YYYY-MM-DD") : "-";
    }
  },
  {
    label: "租赁结束时间",
    prop: "endDate",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ endDate }) => {
      return endDate ? dayjs(endDate).format("YYYY-MM-DD") : "-";
    }
  },
  {
    label: "备注",
    prop: "remark",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },

  {
    label: "附件",
    prop: "leaseFile",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ leaseFile }) =>
      h(
        "div",
        leaseFile.length > 0
          ? [
              h(PreviewButton, { srcList: leaseFile }),
              h(DownloadButton, { srcList: leaseFile })
            ]
          : []
      )
  }
];
