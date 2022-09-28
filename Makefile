run: www node_modules
	cd www && pwd && python -m http.server 6660
node_modules: package.json package-lock.json
	npm i
www: www/pkg www/build
	cp index.html www/
www/pkg: src/*.rs Cargo.toml Makefile
	@mkdir -p www/pkg
	wasm-pack build --target web --out-dir pkg
	cp -r pkg/* www/pkg/
	@touch $@
www/build: ts/*.ts ts/*.tsx Makefile node_modules
	@mkdir -p www/build
	npx tsc ts/*.ts ts/*.tsx --outDir build --target es6 \
		--module commonjs \
		--esModuleInterop true \
		--strict --checkJs \
		--jsx react
	npx webpack
	@touch $@

tswatch: ts/*.ts ts/*.tsx Makefile node_modules package.json webpack.config.js
	npx tsc ts/*.ts ts/*.tsx --outDir build --target es6 \
		--module commonjs \
		--esModuleInterop true \
		--strict --checkJs \
		--jsx react \
		--watch
webpackwatch: build/*.js Makefile package.json webpack.config.js
	npx webpack watch
watch: ; ${MAKE} -j4 tswatch webpackwatch
