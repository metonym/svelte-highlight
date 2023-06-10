const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const preprocess = require("svelte-preprocess");

const NODE_ENV = process.env.NODE_ENV || "development";
const PROD = NODE_ENV === "production";

module.exports = {
  entry: { "build/bundle": ["./src/index.ts"] },
  resolve: {
    alias: { svelte: path.dirname(require.resolve("svelte/package.json")) },
    extensions: [".mjs", ".ts", ".js", ".svelte"],
    mainFields: ["svelte", "browser", "module", "main"],
  },
  output: {
    publicPath: "/",
    path: path.join(__dirname, "/public"),
    filename: PROD ? "[name].[contenthash].js" : "[name].js",
    chunkFilename: "[name].[id].js",
  },
  module: {
    rules: [
      {
        test: /\.svelte$/,
        use: {
          loader: "svelte-loader",
          options: {
            hotReload: !PROD,
            preprocess: preprocess(),
            compilerOptions: { dev: !PROD },
          },
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /node_modules\/svelte\/.*\.mjs$/,
        resolve: { fullySpecified: false },
      },
    ],
  },
  mode: NODE_ENV,
  plugins: [
    new MiniCssExtractPlugin({
      filename: PROD ? "[name].[chunkhash].css" : "[name].css",
    }),
    new HtmlWebpackPlugin({
      templateContent: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body></body>
      </html>
      `,
    }),
  ],
  stats: "errors-only",
  devtool: PROD ? false : "source-map",
  devServer: { hot: true, historyApiFallback: true },
};
