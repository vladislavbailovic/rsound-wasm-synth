run: www
	cd www && pwd && python -m http.server 6660
www: www/pkg www/build
	@echo "yay"
www/pkg: src/*.rs Cargo.toml Makefile
	wasm-pack build --target web --out-dir www/pkg
	@touch $@
www/build: www/src/*.ts www/index.html Makefile
	cd www && npx tsc src/index.ts --outDir build --target es6 --module es2020
	@touch $@

tswatch: www/src/*.ts www/index.html Makefile
	cd www && npx tsc src/index.ts --outDir build --target es6 --module es2020 --strict --checkJs --watch
