import { isPhone } from "@pureadmin/utils";
import { isIdCard, isTel } from "@/utils/validate";

export const PASSWORD_INIT_DATA = {
  oldPwd: "",
  newPwd: "",
  newPwdOk: ""
};
export const PERSONAL_INIT_DATA = {
  staffId: "",
  staffCode: "",
  staffName: "",
  sex: "",
  healthInfo: "",
  nativePlace: "",
  nationality: "",
  birthday: "",
  shortNumber: "",
  idCard: "",
  jobStatus: 0,
  jobStatusDesc: "",
  officePhone: "",
  homeAddress: "",
  mobile: "",
  jobTitleName: "",
  jobLevel: "",
  deptName: "",
  remarks: "",
  userName: ""
};

export const validatePhone = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback();
  }
  if (!isPhone(value)) {
    callback(new Error("手机号格式不正确"));
  } else {
    callback();
  }
};
export const validateIDCard = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback();
  }
  if (!isIdCard(value)) {
    callback(new Error("身份证号格式不正确"));
  } else {
    callback();
  }
};
export const validateTel = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback();
  }
  if (!isTel(value)) {
    callback(new Error("办公电话格式不正确"));
  } else {
    callback();
  }
};
