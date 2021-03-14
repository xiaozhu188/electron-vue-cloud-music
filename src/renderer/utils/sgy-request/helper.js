export function isObject(val) {
    return val !== null && typeof val === "object";
}

export function isPlainObject(val) {
    return Object.prototype.toString.call(val) === "[object Object]";
}

export function isDate(val) {
    return Object.prototype.toString.call(val) === "[object Date]";
}

export function deepMerge(...objs) {
    const result = Object.create(null);

    objs.forEach((obj) => {
        if (obj) {
            Object.keys(obj).forEach((key) => {
                const val = obj[key];
                if (isPlainObject(val)) {
                    if (isPlainObject(result[key])) {
                        result[key] = deepMerge(result[key], val);
                    } else {
                        result[key] = deepMerge(val);
                    }
                } else {
                    result[key] = val;
                }
            });
        }
    });

    return result;
}
