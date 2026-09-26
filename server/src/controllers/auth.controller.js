"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboarding = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const intelligence_model_1 = require("../models/intelligence.model");
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
const register = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        const existingUser = await user_model_1.User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: 'User already exists' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = new user_model_1.User({ email, passwordHash, name, role });
        await user.save();
        if (role === user_model_1.Role.STUDENT) {
            // Create empty profile
            const profile = new user_model_1.StudentProfile({ user: user._id });
            await profile.save();
            const learningProfile = new intelligence_model_1.StudentLearningProfile({ student: user._id });
            await learningProfile.save();
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await user_model_1.User.findOne({ email });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.login = login;
const onboarding = async (req, res) => {
    try {
        // Requires auth middleware
        const userId = req.user.id;
        const { learningGoal, studyTimeAvailability, learningPreferences } = req.body;
        const profile = await user_model_1.StudentProfile.findOneAndUpdate({ user: userId }, { learningGoal, studyTimeAvailability, learningPreferences }, { new: true });
        res.status(200).json(profile);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.onboarding = onboarding;
//# sourceMappingURL=auth.controller.js.map