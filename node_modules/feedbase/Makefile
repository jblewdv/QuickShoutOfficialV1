env = morden

test:
	dapple test --report
deploy:
	dapple run deploy/$(env).ds -e $(env)
	dapple build -e $(env)
