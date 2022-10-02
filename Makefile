CSSFILES=$(shell find ts -type f -name '*.css')
TSFILES=$(shell find ts -type f -name '*.ts')
TSXFILES=$(shell find ts -type f -name '*.tsx')
PYTHON=$(shell command -v python || echo "python3")

run: www node_modules
	cd www && pwd && $(PYTHON) -m http.server 6660

node_modules: package.json package-lock.json
	npm i

www: pkg www/build
	cp index.html www/

pkg: src/*.rs Cargo.toml Makefile
	wasm-pack build --target web --out-dir pkg
	@touch $@

www/build: $(TSFILES) $(TSXFILES) $(CSSFILES) Makefile node_modules
	@mkdir -p www/build
	npx prettier ts webpack.config.js .eslintrc.js -w
	npx eslint ts webpack.config.js .eslintrc.js --fix
	npx tsc ts/*.ts ts/*.tsx --outDir build --target es6 \
		--module commonjs \
		--esModuleInterop true \
		--strict --checkJs \
		--jsx react
	cd ts && rsync -zarv --include "*/" --include="*.css" --exclude="*" "." "../build" && cd -
	npx webpack
	@touch $@

tswatch: $(TSFILES) $(TSXFILES) $(CSSFILES) Makefile node_modules package.json webpack.config.js
	npx prettier ts webpack.config.js .eslintrc.js -w
	npx eslint ts webpack.config.js .eslintrc.js --fix
	cd ts && rsync -zarv --include "*/" --include="*.css" --exclude="*" "." "../build" && cd -
	npx tsc ts/*.ts ts/*.tsx --outDir build --target es6 \
		--module commonjs \
		--esModuleInterop true \
		--strict --checkJs \
		--jsx react \
		--watch
webpackwatch: build/*.js Makefile package.json webpack.config.js
	npx webpack watch
watch: ; ${MAKE} -j4 tswatch webpackwatch
