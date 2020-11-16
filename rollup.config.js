import path from "path";
import resolve from "@rollup/plugin-node-resolve";
// import pkg from "./package.json";

const resolvePath = function (...args) {
  return path.resolve(__dirname, ...args);
};
const extensions = [".js", ".ts"];

export default {
  input: resolvePath("./src/BizChartSyncTooltip.tsx"),
  output: {
    file: "./dist",
    format: "umd",
  },
  plugins: [
    resolve({
      extensions,
      modulesOnly: true,
    }),
  ],
};
