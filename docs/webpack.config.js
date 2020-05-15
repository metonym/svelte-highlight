const webpack = require("webpack");
const path = require("path");
const glob = require("glob");
const config = require("@metonym/sapper/config/webpack.js");
const pkg = require("./package.json");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const PurgecssPlugin = require("purgecss-webpack-plugin");

const mode = process.env.NODE_ENV || "production";
const dev = mode === "development";

const alias = {
  svelte: path.resolve("node_modules", "svelte"),
  sapper: path.resolve("node_modules", "@metonym/sapper"),
};
const extensions = [".mjs", ".js", ".json", ".svelte", ".html"];
const mainFields = ["svelte", "module", "browser", "main"];

module.exports = {
  client: {
    entry: config.client.entry(),
    output: config.client.output(),
    resolve: { alias, extensions, mainFields },
    module: {
      rules: [
        {
          test: /\.(svelte|html)$/,
          use: {
            loader: "svelte-loader",
            options: {
              dev,
              immutable: true,
              hydratable: true,
              hotReload: false,
            },
          },
        },
        {
          test: [/\.css$/],
          use: [
            !dev ? MiniCssExtractPlugin.loader : "style-loader",
            "css-loader",
          ],
        },
      ],
    },
    mode,
    plugins: [
      new MiniCssExtractPlugin({ filename: "[name].[chunkhash:8].css" }),
      new PurgecssPlugin({
        paths: glob.sync(`${path.join(__dirname, "src")}/**/*`, {
          nodir: true,
        }),
        whitelistPatternsChildren: () => {
          return [/^SideNav-/, /^Box-/, /^tabnav-/, /^flash/, /^hljs/];
        },
        keyframes: true,
      }),
      new OptimizeCssAssetsPlugin({}),
      new webpack.DefinePlugin({
        "process.browser": true,
        "process.env.NODE_ENV": JSON.stringify(mode),
      }),
    ].filter(Boolean),
    devtool: dev && "inline-source-map",
  },
  server: {
    entry: config.server.entry(),
    output: config.server.output(),
    target: "node",
    resolve: { alias, extensions, mainFields },
    externals: Object.keys(pkg.dependencies).concat("encoding"),
    module: {
      rules: [
        {
          test: /\.(svelte|html)$/,
          use: {
            loader: "svelte-loader",
            options: { css: false, generate: "ssr", dev },
          },
        },
      ],
    },
    mode,
    performance: { hints: false },
  },
};
