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
};
