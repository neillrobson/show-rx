import livereload from "rollup-plugin-livereload";
import serve from "rollup-plugin-serve";

console.log(process.env.NODE_ENV);

const isDev = process.env.NODE_ENV === "development";

export default {
  external: ["rxjs"],
  input: "src/index.js",
  output: [
    {
      file: "dist/index.umd.js",
      format: "umd",
      name: "RxJsVisualizer",
      globals: {
        rxjs: "rxjs",
      },
    },
  ],
  plugins: isDev
    ? [
        serve({
          open: true,
          contentBase: ["dist", "demo"],
        }),
        livereload("dist"),
      ]
    : [],
};
