import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { builtinModules } from "module";

export default {
  input: "src/plugin.ts",
  output: {
    file: "com.chris.claude-sessions.sdPlugin/bin/plugin.js",
    format: "esm",
    sourcemap: true,
  },
  external: [
    ...builtinModules,
    ...builtinModules.map((m) => `node:${m}`),
  ],
  plugins: [
    resolve({ preferBuiltins: true }),
    commonjs(),
    typescript({ tsconfig: "./tsconfig.json" }),
  ],
};
