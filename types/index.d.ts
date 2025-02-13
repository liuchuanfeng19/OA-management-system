// 此文件跟同级目录的 global.d.ts 文件一样也是全局类型声明，只不过这里存放一些零散的全局类型，无需引入直接在 .vue 、.ts 、.tsx 文件使用即可获得类型提示

type RefType<T> = T | null;

type EmitType = (event: string, ...args: any[]) => void;

type TargetContext = "_self" | "_blank";

type ComponentRef<T extends HTMLElement = HTMLDivElement> =
  ComponentElRef<T> | null;

type ElRef<T extends HTMLElement = HTMLDivElement> = Nullable<T>;

type ForDataType<T> = {
  [P in T]?: ForDataType<T[P]>;
};

type AnyFunction<T> = (...args: any[]) => T;

type PropType<T> = VuePropType<T>;

type Writable<T> = {
  -readonly [P in keyof T]: T[P];
};

type Nullable<T> = T | null;

type NonNullable<T> = T extends null | undefined ? never : T;

type Recordable<T = any> = Record<string, T>;

type ReadonlyRecordable<T = any> = {
  readonly [key: string]: T;
};

type Indexable<T = any> = {
  [key: string]: T;
};

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

type Exclusive<T, U> = (Without<T, U> & U) | (Without<U, T> & T);

type TimeoutHandle = ReturnType<typeof setTimeout>;

type IntervalHandle = ReturnType<typeof setInterval>;

type Effect = "light" | "dark";

interface ChangeEvent extends Event {
  target: HTMLInputElement;
}

interface WheelEvent {
  path?: EventTarget[];
}

interface ImportMetaEnv extends ViteEnv {
  __: unknown;
}

interface Fn<T = any, R = T> {
  (...arg: T[]): R;
}

interface PromiseFn<T = any, R = T> {
  (...arg: T[]): Promise<R>;
}

interface ComponentElRef<T extends HTMLElement = HTMLDivElement> {
  $el: T;
}

interface TableButton {
  buttonName: string; //按钮显示名称：编辑
  buttonCode: string; //按钮编码：PurchaseInfo.edit
  buttonCode: string; //按钮编码：PurchaseInfo.edit
  buttonIcon: string; //按钮图标：edit
  buttonType: EpPropMergeType<
    StringConstructor,
    | ""
    | "default"
    | "warning"
    | "success"
    | "info"
    | "primary"
    | "danger"
    | "text",
    unknown
  >; //按钮样式：primary
  buttonClick: string; //按钮点击事件:handleEdit
  isTableColum: boolean; //是否是表格操作列按钮:false
  isLink: boolean; //是否为链接按钮:false
  popconfirmTitle: string; //按钮气泡标题:是否确认删除
  loading?: boolean;
  dropdown?;
}

interface TableColum {
  value?: any; //按钮显示名称：编辑
  read?: boolean; //按钮显示名称：编辑
  label: string; //按钮编码：PurchaseInfo.edit
  prop: string; //按钮图标：edit
  align: "left" | "center" | "right"; //按钮样式：primary
  width: string | number; //按钮点击事件:handleEdit
  fixedWidth?: boolean; //是否使用固定宽度
  fixed?: string | boolean; //列是否固定在左侧或者右侧。 true 表示固定在左侧
  span?: number;
  formatter?: any; //按钮气泡标题:是否确认删除
  isFormItem: boolean;
  hideColumn?: boolean;
  readonly?: boolean;
  tableColumnSlot?: any;
  condition?: Function;
  showOverflowTooltip: boolean; //当内容过长被隐藏时显示 tooltip
  children?: Array<TableColum>; //当内容过长被隐藏时显示 tooltip
}

interface PageTableResult<T> {
  pageIndex: number; //页码
  pageCount: number; //页数量
  totalCount: number; //总数量
  pageSize: number; //每页数量
  data: Array<T>; //表格数据
}

// function parseInt(s: string | number, radix?: number): number;

// function parseFloat(string: string | number): number;
