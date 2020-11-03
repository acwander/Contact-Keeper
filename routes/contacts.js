const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const User = require('../models/User');
const Contact = require('../models/Contact');

// @route   GET api/contacts
// @desc    Get all users contacts
// @access  Private
router.get('/', auth, async (req, res) => {
	try {
		const contacts = await Contact.find({ user: req.user.id }).sort({
			date: -1,
		});
		res.json(contacts);
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server Error');
	}
});

// @route   POST api/contacts
// @desc    Add new contact
// @access  Private
router.post(
	'/',
	[auth, [body('name', 'Name is required').not().isEmpty()]],
	async (req, res) => {
		// Finds the validation errors in this request and wraps them in an object with handy functions
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			// Send array of errors
			return res.status(400).json({ errors: errors.array() });
		}

		const { name, email, phone, type } = req.body;

		try {
			const newContact = new Contact({
				name,
				email,
				phone,
				type,
				user: req.user.id,
			});

			const contact = await newContact.save();

			res.json(contact);
		} catch (error) {
			console.error(error.message);
			res.status(500).send('Server Error');
		}
	}
);

// @route   PUT api/contacts/:id
// @desc    Update contact
// @access  Private
router.put('/:id', auth, async (req, res) => {
	const { name, email, phone, type } = req.body;

	// Build contact object
	const contactFields = {};
	if (name) contactFields.name = name;
	if (email) contactFields.email = email;
	if (phone) contactFields.phone = phone;
	if (type) contactFields.type = type;

	try {
		let contact = await Contact.findById(req.params.id);

		if (!contact) return res.status(404).json({ msg: 'Contact not found' });

		// Make sure user owns contact
		if (contact.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'Not authorized' });
		}

		contact = await Contact.findByIdAndUpdate(
			req.params.id,
			{
				$set: contactFields,
			},
			{ new: true }
		);
		res.json(contact);
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server Error');
	}
});

// @route   DELETE api/contacts/:id
// @desc    Delete contact
// @access  Private
router.delete('/:id', (req, res) => {
	res.send('Delete contact');
});

module.exports = router;
