default: s

install:
	rm -rf venv node_modules
	npm install
	python3 -m venv venv
	source venv/bin/activate && pip install -r requirements.txt

s:
	npm start

b:
	npm run build