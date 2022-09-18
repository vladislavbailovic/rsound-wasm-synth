deploy: www/pkg
	cp -r www/* /mnt/c/Users/vladi/proj/rsound-wasm-synth/ 
www/pkg: src/*.rs Cargo.toml www
	wasm-pack build --no-typescript --target web --out-dir www/pkg
