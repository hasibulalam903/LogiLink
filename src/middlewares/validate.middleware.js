const { ZodError } = require("zod");
const ApiError = require("../utils/ApiError");

const validate = (schema) => {
  return async (req, res, next) => {
    try {
      // Validate request data
      req.validatedData = await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return next(
          new ApiError(400, "Validation failed", errors)
        );
      }

      next(error);
    }
  };
};

module.exports = validate;