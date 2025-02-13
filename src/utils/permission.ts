import { useUserStoreHook } from "@/store/modules/user";

export const hasPermission = function (value) {
  const authRoles = value;
  const authRolesArray = authRoles.split("|") || [];
  // console.log("authRolesArray", authRolesArray);
  let hasAuth = false;
  const buttons = useUserStoreHook().buttons?.map(item => item.itemName);
  // console.log("buttons", buttons);
  for (let index = 0; index < authRolesArray.length; index++) {
    const element = authRolesArray[index];
    hasAuth = buttons.includes(element);
    if (hasAuth) {
      break;
    }
  }
  // console.log("hasAuth", hasAuth);
  return hasAuth;
};
