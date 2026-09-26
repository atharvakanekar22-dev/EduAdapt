import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Role } from '../models/user.model';
import { InterventionType, OverrideAction } from '../models/teacher.model';

dotenv.config();

const API_BASE = 'http://localhost:5000/api';

async function fetchJSON(url: string, method = 'GET', body?: any, token?: string) {
  const headers: Record<string, string> = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  
  if (res.status >= 400) {
    throw new Error(`API Error ${res.status}: ${await res.text()}`);
  }
  
  return res.json();
}

async function testTeacherFlow() {
  console.log('============================================================');
  console.log('TEACHER E2E TEST');
  console.log('============================================================\n');

  // 1. Teacher Registration
  const teacherEmail = `teacher_${Date.now()}@example.com`;
  console.log(`Registering Teacher: ${teacherEmail}`);
  const regTeacher = await fetchJSON('/auth/register', 'POST', { 
    email: teacherEmail, 
    password: 'password123', 
    name: 'Mr. Teacher', 
    role: Role.TEACHER 
  });
  const tToken = regTeacher.token;

  // 2. Student Registration
  const studentEmail = `student_${Date.now()}@example.com`;
  console.log(`Registering Student: ${studentEmail}`);
  const regStudent = await fetchJSON('/auth/register', 'POST', { 
    email: studentEmail, 
    password: 'password123', 
    name: 'Little Timmy', 
    role: Role.STUDENT 
  });
  const sToken = regStudent.token;

  // 3. Verify Student Cannot Access Teacher Endpoint
  console.log('\n--- VERIFYING RBAC ---');
  try {
    await fetchJSON('/teacher/dashboard', 'GET', null, sToken);
    console.error('FAIL: Student accessed teacher dashboard!');
  } catch (err: any) {
    if (err.message.includes('403') || err.message.includes('Forbidden')) {
      console.log('SUCCESS: Student rejected from teacher dashboard (403).');
    } else {
      throw err;
    }
  }

  // 4. Submit Diagnostic (as Student) to generate data
  console.log('\n--- SEEDING STUDENT DATA ---');
  const assessments = await fetchJSON('/assessments', 'GET', null, sToken);
  const diag = assessments.find((a: any) => a.isDiagnostic);
  const diagDetails = await fetchJSON(`/assessments/${diag._id}`, 'GET', null, sToken);
  // Intentionally fail to create weak mastery and misconceptions
  await fetchJSON(`/assessments/${diag._id}/submit`, 'POST', { 
    answers: [{ questionId: diagDetails.questions[0]._id, studentAnswer: 'wrong answer' }] 
  }, sToken);

  // 5. Teacher Dashboard
  console.log('\n--- TEACHER DASHBOARD ---');
  const dashboard = await fetchJSON('/teacher/dashboard', 'GET', null, tToken);
  console.log('Total Students:', dashboard.studentCount);
  console.log('Students Requiring Attention:', dashboard.studentsRequiringAttention);
  console.log('Misconceptions:', dashboard.misconceptionCounts);

  // 6. Common Misconception Analytics
  console.log('\n--- COMMON MISCONCEPTIONS ---');
  const misconceptions = await fetchJSON('/teacher/misconceptions', 'GET', null, tToken);
  console.log(misconceptions.map((m: any) => `${m.misconception} (Affected: ${m.studentCount})`));

  // 7. Teacher looks at Student List
  console.log('\n--- STUDENT LIST ---');
  const students = await fetchJSON('/teacher/students', 'GET', null, tToken);
  const timmy = students.find((s: any) => s.email === studentEmail);
  console.log(`Student: ${timmy.name}, Weak Topics: ${timmy.weakTopics}`);

  // 8. Open Timmy\'s Intelligence Profile
  console.log('\n--- STUDENT INTELLIGENCE ---');
  const intel = await fetchJSON(`/teacher/students/${timmy._id}`, 'GET', null, tToken);
  console.log('Mastery Records:', intel.masteries.length);
  console.log('Detected Misconceptions:', intel.profile.detectedMisconceptions);

  // 9. Teacher Creates Intervention
  console.log('\n--- TEACHER INTERVENTION ---');
  const weakMastery = intel.masteries.find((m: any) => m.level === 'WEAK');
  if (weakMastery) {
    const intervention = await fetchJSON('/teacher/interventions', 'POST', {
      studentId: timmy._id,
      topicId: weakMastery.topic._id,
      type: InterventionType.RETEACH,
      reason: 'Student failed the diagnostic loop question miserably.'
    }, tToken);
    console.log('Created Intervention:', intervention.type, 'for', weakMastery.topic.name);
  }

  // 10. Teacher Creates Override
  console.log('\n--- TEACHER OVERRIDE ---');
  if (weakMastery) {
    const override = await fetchJSON('/teacher/override', 'POST', {
      studentId: timmy._id,
      topicId: weakMastery.topic._id,
      action: OverrideAction.FORCE_REVISION,
      reason: 'Forcing revision before advancing.'
    }, tToken);
    console.log('Created Override:', override.action, 'for', weakMastery.topic.name);

    // Verify student's path changed
    const pythonId = weakMastery.topic.subject;
    const path = await fetchJSON(`/learning/path/${pythonId}`, 'GET', null, sToken);
    const node = path.nodes.find((n: any) => n.topic._id === weakMastery.topic._id);
    console.log(`Student Path Node State updated to: ${node.state}`);
  }

  console.log('\nTesting Complete!');
}

testTeacherFlow().catch(console.error);
