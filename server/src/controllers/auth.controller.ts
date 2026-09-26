import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Role, StudentProfile, TeacherProfile } from '../models/user.model';
import { StudentLearningProfile } from '../models/intelligence.model';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ email, passwordHash, name, role });
    await user.save();

    if (role === Role.STUDENT) {
      // Create empty profile
      const profile = new StudentProfile({ user: user._id });
      await profile.save();
      const learningProfile = new StudentLearningProfile({ student: user._id });
      await learningProfile.save();
    } else if (role === Role.TEACHER) {
      const profile = new TeacherProfile({ user: user._id });
      await profile.save();
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const onboarding = async (req: Request, res: Response): Promise<void> => {
  try {
    // Requires auth middleware
    const userId = (req as any).user.id;
    const { learningGoal, studyTimeAvailability, learningPreferences } = req.body;

    const profile = await StudentProfile.findOneAndUpdate(
      { user: userId },
      { learningGoal, studyTimeAvailability, learningPreferences },
      { new: true }
    );

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
