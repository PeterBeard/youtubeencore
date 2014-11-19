JSCOMPRESSOR=java -jar ~/yuicompressor-2.4.8.jar
JSFILES = main.js qr.js
JSMIN = $(JSFILES:.js=.min.js)

minify: $(JSFILES) $(JSMIN)

%.min.js: %.js
	$(JSCOMPRESSOR) --type js $< -o $@

