import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';
export const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    }
    catch (error) {
        if (error instanceof ZodError) {
            const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
            next(new AppError(`Validation Error: ${messages}`, 400));
        }
        else {
            next(error);
        }
    }
};
//# sourceMappingURL=validate.js.map