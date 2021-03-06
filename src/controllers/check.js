const Report = require('../models/report');
const Check = require('./../models/check');
const CheckWorker = require('./../workers/check');

const create = async (req, res) => {
    try {
        const check = new Check({
            ...req.body,
            owner: req.user._id
        });
        await check.save();
        return res.status(201).send(check);
    } catch (e) {
        return res.status(400).send(e.message);
    }
};

const retrieveAll = async (req, res) => {
    try {
        const user = req.user;
        await user.populate('checks').execPopulate();
        return res.send(user.checks);
    } catch (e) {
        return res.status(500).send(e.message);
    }
};

const retrieveByTag =  async (req, res) => {
    try {
        const tag = req.params.tag;
        const owner = req.user._id;

        const checks = await Check.find({ 'tags.tag': tag, owner });
        if(!checks.length) {
            return res.status(404).send('check not found!');
        }
        return res.send(checks);
    } catch (e) {
        return res.status(500).send(e.message);
    }
};

const retrieve = async (req, res) => {
    try {
        const _id = req.params.id;
        const owner = req.user._id;

        const check = await Check.findOne({ _id, owner });
        if(!check) {
            return res.status(404).send('check not found!');
        }
        return res.send(check);
    } catch (e) {
        return res.status(500).send(e.message);
    }
};

const update = async (req, res) => {
    try {
        if(!Check.isValidUpdate(req)) {
            return res.status(400).send('Invalid updates');
        }
        const _id = req.params.id;
        const owner = req.user._id;
        const check = await Check.findOne({ _id, owner });
        if(!check) {
            return res.status(404).send('check not found');
        }
        await check.update(req);
        return res.send(check);
    } catch (e) {
        return res.status(400).send(e.message)
    }
};

const remove = async (req, res) => {
    try {
        const _id = req.params.id;
        const owner = req.user._id;
        const check = await Check.findOneAndDelete({ _id, owner });
        if(!check) {
            return res.status(404).send('check not found');
        }
        return res.send(check);
    } catch (e) {
        return res.status(500).send(e.message);
    }
};

const run = async (req, res) => {
    try {
        const _id = req.params.id;
        const owner = req.user._id;

        const check = await Check.findOne({ _id, owner });
        if(!check) {
            return res.status(404).send('check not found!');
        }

        // run check worker
        CheckWorker.run(check);

        return res.send(`check ${check.name} monitoring start..`);
    } catch (e) {
        return res.status(500).send(e.message);
    }
};

const retrieveReport = async (req, res) => {
    try {
        const _id = req.params.checkId;
        const owner = req.user._id;

        const check = await Check.findOne({ _id, owner });
        if(!check) {
            return res.status(404).send('check not found!');
        }
        const report = await Report.findOne({ check: check._id });
        if(!report) {
            return res.status(404).send('check has no reports!');
        }
        return res.send(report);
    } catch (e) {
        return res.status(500).send(e.message);
    }
};

module.exports = {
    create,
    retrieveAll,
    retrieveByTag,
    retrieve,
    update,
    remove,
    run,
    retrieveReport
};