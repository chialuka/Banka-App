import Joi from 'joi';

/**
 * Validate the payload of the request object and ensure there are no errors
 * @param {Object} schema
 * @returns {Function} next function for calling the controller
 */
const validateBodyPayload = schema => async (req, res, next) => {
  try {
    const payload = await Joi.validate(req.body, schema, {
      abortEarly: false,
      allowUnknown: true,
    });
    req.body = payload;
    next();
  } catch (error) {
    const errors = error.details.map(item => item.message);
    res.status(400).json({
      status: 400,
      errors,
    });
  }
};

/**
 * Validate the ID params provided for any request
 * @name validateIdParams
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @returns {Function} next() to call the next middleware
 */
const validateIdParams = (req, res, next) => {
  const isInvalid = (/[^\d]/g).test(req.params.id);
  if (isInvalid) {
    return res.status(400).json({
      status: 400,
      error: 'Provided id is invalid. Please provide a positive integer',
    });
  }
  return next();
};

export { validateBodyPayload, validateIdParams };
