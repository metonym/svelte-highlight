const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const HTMLInlineCSSWebpackPlugin = require("html-inline-css-webpack-plugin").default;

const NODE_ENV = process.env.NODE_ENV || "development";
const IS_PROD = NODE_ENV === "production";

module.exports = {
  stats: "errors-only",
  mode: NODE_ENV,
  devtool: IS_PROD ? false : "cheap-eval-source-map",
  entry: { bundle: ["./src/index.js"] },
  resolve: {
    alias: { svelte: path.resolve("node_modules", "svelte") },
    extensions: [".mjs", ".js", ".svelte"],
    mainFields: ["svelte", "browser", "module", "main"]
  },
  output: { path: `${__dirname}/build`, filename: "[name].[chunkhash].js" },
  module: {
    rules: [
      {
        test: /\.svelte$/,
        use: {
          loader: "svelte-loader",
          options: { emitCss: true, hotReload: true }
        }
      },
      {
        test: /\.css$/,
        use: [IS_PROD ? MiniCssExtractPlugin.loader : "style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({ filename: "[name].[chunkhash].css" }),
    new OptimizeCssAssetsPlugin({}),
    new HtmlWebpackPlugin({ template: "public/index.html" }),
    new HTMLInlineCSSWebpackPlugin()
  ]
};
