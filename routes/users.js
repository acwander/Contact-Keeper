const { genSalt } = require('bcryptjs');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
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
	async (req, res) => {
		// Finds the validation errors in this request and wraps them in an object with handy functions
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// Send array of errors
			return res.status(400).json({ errors: errors.array() });
		}

		// De-structure data
		const { name, email, password } = req.body;

		try {
			let user = await User.findOne({ email });

			// If user already exists, throw an error
			if (user) {
				return res.status(400).json({ msg: 'User already exists' });
			}

			// Create user
			user = new User({
				name,
				email,
				password,
			});

			const salt = await bcrypt.genSalt(10);
			// Hash the password
			user.password = await bcrypt.hash(password, salt);
			// Add user to db
			await user.save();

			res.send('User saved');
		} catch (error) {
			console.error(error.message);
			res.status(500).send('Server Error');
		}
	}
);

module.exports = router;
