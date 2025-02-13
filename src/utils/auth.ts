import Cookies from "js-cookie";
import { storageSession } from "@pureadmin/utils";
import { useUserStoreHook } from "@/store/modules/user";

export interface DataInfo<T> {
  name: string;
  username: string;
  staffName: string;
  avatarUrl: string;
  expires: T;
  accessToken: string;
}

export const sessionKey = "user-info";
export const TokenKey = "authorized-token";

/** 获取token */
export function getToken() {
  Cookies.remove(TokenKey);
  // 此处与TokenKey相同，此写法解决初始化时Cookies中不存在TokenKey报错
  return Cookies.get(TokenKey)
    ? JSON.parse(Cookies.get(TokenKey))
    : storageSession().getItem(sessionKey);
}

/** 设置token以及过期时间（cookies、sessionStorage各一份），后端需要将用户信息和token以及过期时间都返回给前端，过期时间主要用于刷新token */
export function setToken({ data }) {
  const { token, expires, loginName, staffName, avatarUrl } = data;
  // 提取关键信息进行存储
  const paramsMap: DataInfo<number> = {
    name: loginName,
    username: loginName,
    staffName,
    avatarUrl,
    expires: Date.now() + parseInt(expires) * 1000,
    accessToken: token
  };
  const cookieString = JSON.stringify(paramsMap);
  expires > 0
    ? Cookies.set(TokenKey, cookieString, {
        expires: expires / 86400
      })
    : Cookies.set(TokenKey, cookieString);

  useUserStoreHook().SET_TOKEN(token);
  useUserStoreHook().SET_NAME(loginName);
  storageSession().setItem(sessionKey, paramsMap);
  sessionStorage.setItem(TokenKey, cookieString);
}

/** 删除token */
export function removeToken() {
  Cookies.remove(TokenKey);
  sessionStorage.removeItem(TokenKey);
  sessionStorage.clear();
}

/** 格式化token（jwt格式） */
export const formatToken = (token: string): string => {
  return "Bearer " + token;
};
