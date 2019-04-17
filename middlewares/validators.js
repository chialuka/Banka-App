import Joi from 'joi';

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

const validateIdParams = (req, res, next) => {
  if (!req.params.id.search(/[^\d]/g)) {
    return res.status(400).json({
      status: 400,
      error: 'Provided id is invalid. Please provide a positive integer',
    });
  }
  return next();
};

export { validateBodyPayload, validateIdParams };
