import { Request, Response } from 'express';
import { MasteryRecord, MasteryLevel, StudentLearningProfile } from '../models/intelligence.model';
import { TeacherIntervention, TeacherOverride, InterventionType, OverrideAction } from '../models/teacher.model';
import { Topic, LearningObjective } from '../models/content.model';
import { Question } from '../models/assessment.model';
import { User, Role } from '../models/user.model';
import { LearningPath } from '../models/learning.model';

export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const teacherId = (req as any).user.id;
    const { TeacherProfile } = require('../models/user.model');
    const tProfile = await TeacherProfile.findOne({ user: teacherId });
    let studentIds = tProfile?.students || [];

    if (studentIds.length === 0) {
      const students = await User.find({ role: Role.STUDENT }).select('_id');
      studentIds = students.map(s => s._id);
    }

    const masteries = await MasteryRecord.find({ student: { $in: studentIds }, topic: { $exists: true, $ne: null } }).populate('topic');
    
    let totalScore = 0;
    let studentsRequiringAttention = new Set<string>();
    
    const topicStats: Record<string, any> = {};

    masteries.forEach(m => {
      totalScore += m.score;
      if (m.level === MasteryLevel.WEAK || m.level === MasteryLevel.UNKNOWN) {
        studentsRequiringAttention.add(m.student.toString());
      }
      
      const topicId = m.topic._id.toString();
      if (!topicStats[topicId]) {
        topicStats[topicId] = { topic: m.topic, mastered: 0, developing: 0, weak: 0, total: 0 };
      }
      
      topicStats[topicId].total++;
      if (m.level === MasteryLevel.MASTERED) topicStats[topicId].mastered++;
      else if (m.level === MasteryLevel.DEVELOPING) topicStats[topicId].developing++;
      else topicStats[topicId].weak++;
    });

    const averageMastery = masteries.length > 0 ? totalScore / masteries.length : 0;
    
    const profiles = await StudentLearningProfile.find({ student: { $in: studentIds } });
    const misconceptionCounts: Record<string, number> = {};
    profiles.forEach(p => {
      p.detectedMisconceptions.forEach(m => {
        misconceptionCounts[m] = (misconceptionCounts[m] || 0) + 1;
      });
    });

    res.status(200).json({
      studentCount: students.length,
      averageMastery,
      studentsRequiringAttention: studentsRequiringAttention.size,
      topicStats: Object.values(topicStats),
      misconceptionCounts
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const teacherId = (req as any).user.id;
    const { TeacherProfile } = require('../models/user.model');
    const tProfile = await TeacherProfile.findOne({ user: teacherId });
    let studentIds = tProfile?.students || [];

    let students = [];
    if (studentIds.length === 0) {
      students = await User.find({ role: Role.STUDENT }).select('_id name email');
    } else {
      students = await User.find({ _id: { $in: studentIds } }).select('_id name email');
    }

    const profiles = await StudentLearningProfile.find().populate('currentFocusSubject');
    
    const result = await Promise.all(students.map(async s => {
      const profile = profiles.find(p => p.student.toString() === s._id.toString());
      const masteries = await MasteryRecord.find({ student: s._id, topic: { $exists: true, $ne: null } });
      let totalScore = 0;
      let weak = 0;
      let developing = 0;
      
      masteries.forEach(m => {
        totalScore += m.score;
        if (m.level === MasteryLevel.WEAK) weak++;
        if (m.level === MasteryLevel.DEVELOPING) developing++;
      });
      
      return {
        _id: s._id,
        name: s.name,
        email: s.email,
        overallMastery: masteries.length > 0 ? totalScore / masteries.length : 0,
        weakTopics: weak,
        developingTopics: developing,
        currentFocus: profile?.currentFocusSubject,
        requiresAttention: weak > 0
      };
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getStudentIntelligence = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const teacherId = (req as any).user.id;
    const { TeacherProfile } = require('../models/user.model');
    
    const student = await User.findById(id);
    if (!student || student.role !== Role.STUDENT) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const tProfile = await TeacherProfile.findOne({ user: teacherId });
    const studentIds = tProfile?.students || [];
    if (studentIds.length > 0 && !studentIds.includes(student._id)) {
      res.status(403).json({ error: 'Forbidden: Student not assigned to you' });
      return;
    }

    const masteries = await MasteryRecord.find({ student: id }).populate('topic learningObjective');
    const profile = await StudentLearningProfile.findOne({ student: id }).populate('currentFocusSubject');
    const paths = await LearningPath.find({ student: id, isActive: true });
    const interventions = await TeacherIntervention.find({ student: id }).sort({ createdAt: -1 });

    res.status(200).json({
      student: { _id: student._id, name: student.name, email: student.email },
      masteries,
      profile,
      paths,
      interventions
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMisconceptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const profiles = await StudentLearningProfile.find();
    const map: Record<string, any> = {};

    profiles.forEach(p => {
      p.detectedMisconceptions.forEach(m => {
        if (!map[m]) map[m] = { misconception: m, studentCount: 0, students: [] };
        map[m].studentCount++;
        map[m].students.push(p.student);
      });
    });

    res.status(200).json(Object.values(map).sort((a, b) => b.studentCount - a.studentCount));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createIntervention = async (req: Request, res: Response): Promise<void> => {
  try {
    const teacherId = (req as any).user.id;
    const { studentId, topicId, learningObjectiveId, type, reason } = req.body;

    const intervention = await TeacherIntervention.create({
      teacher: teacherId,
      student: studentId,
      topic: topicId,
      learningObjective: learningObjectiveId,
      type,
      reason
    });

    res.status(201).json(intervention);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const applyOverride = async (req: Request, res: Response): Promise<void> => {
  try {
    const teacherId = (req as any).user.id;
    const { studentId, topicId, action, reason } = req.body;

    const override = await TeacherOverride.create({
      teacher: teacherId,
      student: studentId,
      topic: topicId,
      action,
      reason
    });

    const topic = await Topic.findById(topicId);
    if (topic && (action === OverrideAction.UNLOCK_TOPIC || action === OverrideAction.FORCE_REVISION)) {
      const path = await LearningPath.findOne({ student: studentId, subject: topic.subject });
      if (path) {
        const { LearningPathNode, NodeState } = require('../models/learning.model');
        const node = await LearningPathNode.findOne({ path: path._id, topic: topicId });
        if (node) {
          node.state = action === OverrideAction.UNLOCK_TOPIC ? NodeState.RECOMMENDED : NodeState.REVIEW_REQUIRED;
          await node.save();
        }
      }
    }

    res.status(201).json(override);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, payload } = req.body;
    if (type === 'topic') {
      const topic = await Topic.create(payload);
      res.status(201).json(topic);
    } else if (type === 'objective') {
      const obj = await LearningObjective.create(payload);
      res.status(201).json(obj);
    } else if (type === 'question') {
      const q = await Question.create(payload);
      res.status(201).json(q);
    } else {
      res.status(400).json({ error: 'Invalid content type' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
