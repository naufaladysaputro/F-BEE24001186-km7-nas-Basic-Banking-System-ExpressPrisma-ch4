const createHttpError = require('http-errors');

module.exports = (schema, source = "body") => {
    return async (req, res, next) => {
        try {
            // Memilih sumber validasi dari req (body, params, atau query)
            const dataToValidate = req[source];
            const validated = await schema.validateAsync(dataToValidate);
            
            // Menyimpan hasil validasi kembali ke source asli (req.body, req.params, atau req.query)
            req[source] = validated;
            next();
        } catch (error) {
            if (error.isJoi) {
                return next(createHttpError(422, { message: error.message }));
            }
            next(createHttpError(500));
        }
    };
};
