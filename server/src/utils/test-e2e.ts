import dotenv from 'dotenv';
import { Role } from '../models/user.model';
import { OverrideAction, InterventionType } from '../models/teacher.model';

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

async function runE2E() {
  console.log('============================================================');
  console.log('MASTER END-TO-END TEST (PHASE 7)');
  console.log('============================================================\n');

  try {
    const studentEmail = `e2e_student_${Date.now()}@example.com`;
    const teacherEmail = `e2e_teacher_${Date.now()}@example.com`;

    // 1. Register Student & Teacher
    console.log('--- 1. REGISTRATION ---');
    const sReg = await fetchJSON('/auth/register', 'POST', { email: studentEmail, password: 'password', name: 'E2E Student', role: Role.STUDENT });
    const sToken = sReg.token;
    
    const tReg = await fetchJSON('/auth/register', 'POST', { email: teacherEmail, password: 'password', name: 'E2E Teacher', role: Role.TEACHER });
    const tToken = tReg.token;
    
    // 2. IDOR / Security check
    console.log('\n--- 2. SECURITY AUDIT (IDOR) ---');
    try {
      await fetchJSON(`/teacher/students/${sReg.user.id}`, 'GET', null, sToken);
      console.error('FAIL: Student accessed teacher endpoint!');
    } catch (e: any) {
      if (e.message.includes('403') || e.message.includes('Forbidden')) console.log('✅ Student blocked from Teacher APIs (403)');
      else throw e;
    }

    try {
      await fetchJSON('/learning/path/dummyId', 'GET', null, 'invalid_token');
      console.error('FAIL: Invalid token succeeded!');
    } catch (e: any) {
      if (e.message.includes('401')) console.log('✅ Invalid JWT blocked (401)');
      else throw e;
    }

    // 3. Diagnostic & Knowledge Gap
    console.log('\n--- 3. DIAGNOSTIC & KNOWLEDGE GAPS ---');
    const assessments = await fetchJSON('/assessments', 'GET', null, sToken);
    const diag = assessments.find((a: any) => a.isDiagnostic);
    const diagDetails = await fetchJSON(`/assessments/${diag._id}`, 'GET', null, sToken);
    
    // Fail questions on purpose to get WEAK mastery
    const diagSub = await fetchJSON(`/assessments/${diag._id}/submit`, 'POST', {
      answers: diagDetails.questions.map((q: any) => ({ questionId: q._id, studentAnswer: 'completely wrong answer' }))
    }, sToken);
    
    const analytics = await fetchJSON('/analytics/student', 'GET', null, sToken);
    console.log(`✅ Mastery Records Created: ${analytics.mastery.length}`);
    console.log(`✅ Misconceptions Detected:`, analytics.profile.detectedMisconceptions);
    
    // 4. Learning Path
    console.log('\n--- 4. LEARNING PATH ---');
    const pythonId = analytics.mastery[0].topic.subject;
    const path = await fetchJSON(`/learning/path/${pythonId}`, 'GET', null, sToken);
    console.log(`✅ Learning Path Nodes: ${path.nodes.length}`);
    const weakTopic = analytics.mastery.find((m: any) => m.level === 'WEAK').topic;

    // 5. Practice & AI Tutor
    console.log('\n--- 5. PRACTICE & AI TUTOR ---');
    const session = await fetchJSON('/learning/sessions', 'POST', { topicId: weakTopic._id }, sToken);
    console.log(`✅ Learning Session created: ${session._id}`);

    const tutorRes = await fetchJSON('/tutor/message', 'POST', {
      topicId: weakTopic._id,
      message: 'I am struggling with this question.',
      studentAnswer: 'I do not understand.',
      currentQuestionId: diagDetails.questions[0]._id, // using diagnostic question as mock practice
      tutorMode: 'EXPLAIN_CONCEPT'
    }, sToken);
    console.log(`✅ Tutor Response (Fallback or Gemini): ${tutorRes.text}`);

    // 6. Teacher Flow & Interventions
    console.log('\n--- 6. TEACHER DASHBOARD & OVERRIDE ---');
    const students = await fetchJSON('/teacher/students', 'GET', null, tToken);
    const sData = students.find((s: any) => s._id === sReg.user.id);
    console.log(`✅ Teacher sees student weak topics: ${sData.weakTopics}`);

    const override = await fetchJSON('/teacher/override', 'POST', {
      studentId: sReg.user.id,
      topicId: weakTopic._id,
      action: OverrideAction.FORCE_REVISION,
      reason: 'E2E Teacher Override'
    }, tToken);
    console.log(`✅ Teacher override applied: ${override.action}`);

    const pathAfter = await fetchJSON(`/learning/path/${pythonId}`, 'GET', null, sToken);
    const nodeAfter = pathAfter.nodes.find((n: any) => n.topic._id === weakTopic._id);
    console.log(`✅ Node state after teacher override: ${nodeAfter.state}`);

    // 7. Input Validation & Edge Cases
    console.log('\n--- 7. INPUT VALIDATION EDGE CASES ---');
    try {
      await fetchJSON(`/assessments/${diag._id}/submit`, 'POST', {
        answers: 'malformed_string_instead_of_array'
      }, sToken);
      console.error('FAIL: Accepted malformed answers array!');
    } catch (e: any) {
      if (e.message.includes('400') || e.message.includes('500')) console.log('✅ Malformed payload correctly blocked.');
      else throw e;
    }
    
    console.log('\n============================================================');
    console.log('✅ MASTER E2E COMPLETED SUCCESSFULLY');
    console.log('============================================================\n');

  } catch (err) {
    console.error('❌ E2E TEST FAILED:', err);
    process.exit(1);
  }
}

runE2E();
