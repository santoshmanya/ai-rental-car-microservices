const Joi = require('joi');

const validateRegistration = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        firstName: Joi.string().min(2).max(100).required(),
        lastName: Joi.string().min(2).max(100).required(),
        phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional(),
        role: Joi.string().valid('customer', 'admin').optional(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            error: { message: error.details[0].message }
        });
    }

    next();
};

const validateLogin = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            error: { message: error.details[0].message }
        });
    }

    next();
};

module.exports = {
    validateRegistration,
    validateLogin,
};
