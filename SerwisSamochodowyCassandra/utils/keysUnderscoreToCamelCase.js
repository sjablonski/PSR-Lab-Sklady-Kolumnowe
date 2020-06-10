const toCamel = (s) => {
    return s.replace(/([-_][a-z])/ig, ($1) => {
        return $1.toUpperCase()
            .replace('-', '')
            .replace('_', '');
    });
};

const isObject = (o) => {
    return o === Object(o) && !isArray(o) && typeof o !== 'function';
};

const isArray = (a) => {
    return Array.isArray(a);
};

const keysUnderscoreToCamelCase = (o) => {
    if (isObject(o)) {
        const n = {};

        Object.keys(o).forEach((k) => {
            n[toCamel(k)] = keysUnderscoreToCamelCase(o[k]);
        });

        return n;
    } else if (isArray(o)) {
        return o.map((i) => keysUnderscoreToCamelCase(i));
    }

    return o;
};

module.exports = keysUnderscoreToCamelCase;