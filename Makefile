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
	npx tsc ts/*.ts ts/*.tsx --outDir www/build --target es6 \
		--module node16 \
		--strict --checkJs \
		--jsx preserve \
		--lib es2015,dom
	npx babel www/build/*.jsx --out-dir www/build/ --presets=@babel/preset-env
	@touch $@

tswatch: ts/*.ts ts/*.tsx Makefile node_modules
	@mkdir -p www/build
	npx tsc ts/*.ts ts/*.tsx --outDir www/build --target es6 \
		--module node16 \
		--strict --checkJs \
		--jsx preserve \
		--lib es2015,dom \
		--watch
