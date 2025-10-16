const express = require('express');
const router = express.Router();
const Party = require('../models/Party');
const { isValidObjectId } = require('mongoose');

// GET all parties
router.get('/', async (req, res) => {
    try {
        const parties = await Party.find();
        res.json(parties);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET a single party
router.get('/:id', async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid Party ID' });
    }
    try {
        const party = await Party.findById(req.params.id);
        if (!party) {
            return res.status(404).json({ message: 'Party not found' });
        }
        res.json(party);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE a party
router.post('/', async (req, res) => {
    const { name, date } = req.body;
    const party = new Party({
        name,
        date,
        friends: [],
        tasks: [],
        expenses: [],
    });

    try {
        const newParty = await party.save();
        res.status(201).json(newParty);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE a party
router.put('/:id', async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid Party ID' });
    }
    try {
        // remove id and _id from body to prevent trying to update them
        const { id, _id, ...updateData } = req.body;
        
        const updatedParty = await Party.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!updatedParty) {
            return res.status(404).json({ message: 'Party not found' });
        }
        res.json(updatedParty);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a party
router.delete('/:id', async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid Party ID' });
    }
    try {
        const party = await Party.findByIdAndDelete(req.params.id);
        if (!party) {
            return res.status(404).json({ message: 'Party not found' });
        }
        res.status(204).send(); // No content
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
