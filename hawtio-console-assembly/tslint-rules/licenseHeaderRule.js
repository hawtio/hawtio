function Rule() {
  Lint.Rules.AbstractRule.apply(this, arguments);
}

Rule.prototype = Object.create(Lint.Rules.AbstractRule.prototype);
Rule.prototype.apply = function(sourceFile) {
  return this.applyWithWalker(new LicenseHeaderWalker(sourceFile, this.getOptions()));
};

function LicenseHeaderWalker() {
  Lint.RuleWalker.apply(this, arguments);
}

LicenseHeaderWalker.prototype = Object.create(Lint.RuleWalker.prototype);
LicenseHeaderWalker.prototype.visitSourceFile = function (node) {
  // create a failure at the current position
  var sourceText = this.getSourceFile().text;

  var licenceHeader = this.getOptions()[0];

  if ( sourceText.indexOf(licenceHeader) !== 0 ){
    this.addFailure(this.createFailure(0, 0, "Missing or incorrect project license header."));
  }

  Lint.RuleWalker.prototype.visitSourceFile.call(this, node);
};

exports.Rule = Rule;
