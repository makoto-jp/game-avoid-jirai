module.exports = {
    'parser': 'babel-eslint',
    'env': {
        'es2021': true,
        'node': true
    },
    'extends': 'eslint:recommended',
    'parserOptions': {
        'ecmaVersion': 12,
        'sourceType': 'module'
    },
    'rules': {
        'semi': ['warn', 'always'],
        "no-undef": [ "error" ],
        "no-unused-vars": [ "warn", {
            "vars": "all"
        }],
    }
};
