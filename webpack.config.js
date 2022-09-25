const path = require( 'path');


 module.exports = function(_env, argv) {
  const isProduction = argv.mode === "production";
  const isDevelopment = !isProduction;

  return {
    devtool: isDevelopment && "cheap-module-source-map",
    entry: "./build/site.js",
	  mode: "development",
    output: {
      path: path.resolve(process.cwd(), "www"),
      filename: "build/[name].js",
      publicPath: "/"
    },
	  module: {
		  rules: [
			  {
				  test: /\.jsx?$/,
				  exclude: /node_modules/,
				  use: {
					  loader: "babel-loader"
				  }
			  }
		  ],
	  },
	  resolve: {
		  extensions: [".js", ".jsx"]
	  },
	  experiments: {
		  asyncWebAssembly: true
	  }
  };
};
