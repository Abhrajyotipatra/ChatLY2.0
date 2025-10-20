const { body, validationResult } = require('express-validator');

// Helper function to handle validation errors
const respondWithValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Registration validation rules
const registerUserValidations = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    respondWithValidationErrors
];

// Login validation rules - FINAL WORKING VERSION
const loginUserValidations = [
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    body('email')
        .optional({ checkFalsy: true })
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('username')
        .optional({ checkFalsy: true })
        .trim()
        .notEmpty()
        .withMessage('Username cannot be empty'),
    // Custom validation that safely checks req.body
    body('email').custom((value, { req }) => {
        // This runs AFTER body parsing, so req.body is guaranteed to exist
        const email = req.body?.email;
        const username = req.body?.username;
        
        if (!email && !username) {
            throw new Error('Either email or username is required');
        }
        return true;
    }),
    respondWithValidationErrors
];

module.exports = {
    registerUserValidations,
    loginUserValidations
};
