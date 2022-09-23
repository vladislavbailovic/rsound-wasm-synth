run: www
	cd www && pwd && python -m http.server 6660
www: www/pkg www/build
	cp index.html www/
www/pkg: src/*.rs Cargo.toml Makefile
	@mkdir -p www/pkg
	wasm-pack build --target web --out-dir pkg
	cp -r pkg/* www/pkg/
	@touch $@
www/build: ts/*.ts Makefile
	@mkdir -p www/build
	npx tsc ts/*.ts --outDir www/build --target es6 --module es2020
	@touch $@

tswatch: ts/*.ts www/index.html Makefile
	@mkdir -p www/build
	npx tsc ts/*.ts --outDir www/build --target es6 --module es2020 --strict --checkJs --watch
