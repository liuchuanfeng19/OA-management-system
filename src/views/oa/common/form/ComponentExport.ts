import { defineAsyncComponent } from "vue";

const TextInput = defineAsyncComponent(
  () => import("./components/TextInput.vue")
);
// const NumberInput = defineAsyncComponent(
//   () => import("./components/NumberInput.vue")
// );
// const AmountInput = defineAsyncComponent(
//   () => import("./components/AmountInput.vue")
// );
// const TextareaInput = defineAsyncComponent(
//   () => import("./components/TextareaInput.vue")
// );
// const SelectInput = defineAsyncComponent(
//   () => import("./components/SelectInput.vue")
// );
// const MultipleSelect = defineAsyncComponent(
//   () => import("./components/MultipleSelect.vue")
// );
// const DateTime = defineAsyncComponent(
//   () => import("./components/DateTime.vue")
// );
// const DateTimeRange = defineAsyncComponent(
//   () => import("./components/DateTimeRange.vue")
// );

// const Description = defineAsyncComponent(
//   () => import("./components/Description.vue")
// );
// const ImageUpload = defineAsyncComponent(
//   () => import("./components/ImageUpload.vue")
// );
// const FileUpload = defineAsyncComponent(
//   () => import("./components/FileUpload.vue")
// );
// const Location = defineAsyncComponent(
//   () => import("./components/Location.vue")
// );
// const MoneyInput = defineAsyncComponent(
//   () => import("./components/MoneyInput.vue")
// );
// const DeptPicker = defineAsyncComponent(
//   () => import("./components/DeptPicker.vue")
// );
// const UserPicker = defineAsyncComponent(
//   () => import("./components/UserPicker.vue")
// );
// const SignPanel = defineAsyncComponent(
//   () => import("./components/SignPannel.vue")
// );

// const SpanLayout = defineAsyncComponent(
//   () => import("./components/SpanLayout.vue")
// );
// const TableList = defineAsyncComponent(
//   () => import("./components/TableList.vue")
// );

export default {
  // //基础组件
  TextInput
  // NumberInput,
  // AmountInput,
  // TextareaInput,
  // SelectInput,
  // MultipleSelect,
  // DateTime,
  // DateTimeRange,
  // UserPicker,
  // DeptPicker,
  // //高级组件
  // Description,
  // FileUpload,
  // ImageUpload,
  // MoneyInput,
  // Location,
  // SignPanel,
  // SpanLayout,
  // TableList
};
