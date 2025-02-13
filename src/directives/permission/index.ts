import type { Directive } from "vue";
import type { DirectiveBinding } from "vue";
import { hasPermission } from "@/utils/permission";

export const auth: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding;
    // console.log("value", value);
    if (value) {
      const hasAuth = hasPermission(value);
      // console.log("hasAuth", hasAuth);
      if (!hasAuth) {
        el.parentNode.removeChild(el);
      }
    } else {
      throw new Error(
        "need roles! Like v-auth=\"['LeaveManage.query','LeaveManage.audit']\""
      );
    }
  }
};
