/** 处理环境变量 */
const warpperEnv = (envConf: Recordable): ViteEnv => {
  /** 此处为默认值 */
  const ret: ViteEnv = {
    VITE_PORT: 9002,
    VITE_PUBLIC_PATH: "",
    VITE_PROXY_DOMAIN: "",
    VITE_PROXY_DOMAIN_BFW: "",
    VITE_PROXY_DOMAIN_BUS: "",
    VITE_PROXY_DOMAIN_FILE: "",
    VITE_PROXY_DOMAIN_PREVIEW: "",
    VITE_RUN_MODE: "",
    VITE_ROUTER_HISTORY: "",
    VITE_CDN: false,
    VITE_COMPRESSION: "none"
  };

  for (const envName of Object.keys(envConf)) {
    let realName = envConf[envName].replace(/\\n/g, "\n");
    realName =
      realName === "true" ? true : realName === "false" ? false : realName;

    if (envName === "VITE_PORT") {
      realName = Number(realName);
    }
    ret[envName] = realName;
    if (typeof realName === "string") {
      process.env[envName] = realName;
    } else if (typeof realName === "object") {
      process.env[envName] = JSON.stringify(realName);
    }
  }
  return ret;
};

export { warpperEnv };
