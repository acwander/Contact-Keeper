const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const User = require('../models/User');

// @route   POST api/users
// @desc    Register a user
// @access  Public
router.post(
	'/',
	[
		// name must not be empty
		body('name', 'Name is required').not().isEmpty(),
		// email must be a valid email address
		body('email', 'A valid email is required').isEmail(),
		// password must be at least 6 chars long
		body(
			'password',
			'Enter a valid password with 6 or more characters'
		).isLength({ min: 6 }),
	],
	(req, res) => {
		// Finds the validation errors in this request and wraps them in an object with handy functions
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// Send array of errors
			return res.status(400).json({ errors: errors.array() });
		}
		// Send success if all checks are met
		res.send('success');
	}
);

module.exports = router;
