www/pkg: src/*.rs Cargo.toml www
	wasm-pack build --no-typescript --target web --out-dir www/pkg
