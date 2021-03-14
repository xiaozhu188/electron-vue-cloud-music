module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: ["plugin:vue/essential", "@vue/standard"],
    rules: {
        "no-console": "off",
        "space-in-parens": "off",
        "no-debugger": "off",
        "no-mixed-operators": "off",
        eqeqeq: "off",
        "no-unused-vars": "off",
        camelcase: "off",
        "arrow-parens": "off",
        "generator-star-spacing": "off",
        "object-curly-even-spacing": "on",
        "one-var": "off",
        indent: "off",
        "vue/no-unused-components": "off",
        "no-unneeded-ternary": "off",
        semicolon: "on",
    },
    parserOptions: {
        parser: "babel-eslint",
    },
};
