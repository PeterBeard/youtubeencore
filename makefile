JSCOMPRESSOR = java -jar ~/yuicompressor-2.4.8.jar
JSFILES = main.js qr.js
JSMIN = $(JSFILES:.js=.min.js)

CSSCOMPRESSOR = java -jar ~/yuicompressor-2.4.8.jar
CSSFILES = styles.css
CSSMIN = $(CSSFILES:.css=.min.css)

minify: $(JSFILES) $(JSMIN) $(CSSFILES) $(CSSMIN)

%.min.js: %.js
	$(JSCOMPRESSOR) --type js $< -o $@

%.min.css: %.css
	$(CSSCOMPRESSOR) --type css $< -o $@
