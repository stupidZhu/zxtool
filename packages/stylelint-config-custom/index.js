module.exports = {
  extends: ["stylelint-config-standard-scss", "stylelint-config-idiomatic-order"],
  plugins: ["stylelint-order"],
  rules: {
    "order/order": ["custom-properties", "declarations"],
    "declaration-block-no-redundant-longhand-properties": null,
    "selector-class-pattern": null,
    "block-no-empty": null,
    "no-descending-specificity": null,
    "scss/at-import-partial-extension": null,
    "font-family-no-missing-generic-family-keyword": null,
    "selector-pseudo-class-no-unknown": null,
    "scss/no-global-function-names": null,
    "scss/double-slash-comment-whitespace-inside": null,
    "scss/at-mixin-pattern": null,
    "value-list-comma-newline-after": null,
    "declaration-colon-newline-after": null,
    "max-line-length": 125,
    "value-no-vendor-prefix": null,
    "font-family-name-quotes": null,
    "font-family-no-duplicate-names": null,
    "color-named": null,
    "color-function-notation": null,
    "at-rule-empty-line-before": "never",
    "custom-property-empty-line-before": "never",
    "declaration-empty-line-before": "never",
    "block-closing-brace-empty-line-before": "never",
    "rule-empty-line-before": "never",
    "comment-empty-line-before": "never",
    "no-invalid-double-slash-comments": null,
  },
  defaultSeverity: "warning",
}
