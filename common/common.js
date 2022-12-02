exports.convertNameToSlug = (name) => name.toLowerCase().match(/\w+/g).join("-");
