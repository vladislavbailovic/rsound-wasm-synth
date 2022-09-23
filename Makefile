run: www
	cd www && pwd && python -m http.server 6660
www: www/pkg www/build
	@echo "yay"
www/pkg: src/*.rs Cargo.toml
	wasm-pack build --no-typescript --target web --out-dir www/pkg
	@touch $@
www/build: www/src/*.ts www/index.html Makefile
	cd www && npx tsc src/index.ts --outDir build --target es6 --module es6
	@touch $@
