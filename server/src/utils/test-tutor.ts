import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { TutorMode } from '../models/tutor.model';

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
  return res.json();
}

async function testTutorFlow() {
  console.log('============================================================');
  console.log('TUTOR API END-TO-END TEST');
  console.log('============================================================\n');

  // Register New Student
  const email = `tutorstudent_${Date.now()}@example.com`;
  console.log(`Registering new student: ${email}`);
  const reg = await fetchJSON('/auth/register', 'POST', { email, password: 'password123', name: 'Tutor Student', role: 'STUDENT' });
  const token = reg.token;
  
  // Find an assessment to get subject and topic
  const assessments = await fetchJSON('/assessments', 'GET', null, token);
  const diag = assessments.find((a: any) => a.isDiagnostic);
  const diagDetails = await fetchJSON(`/assessments/${diag._id}`, 'GET', null, token);
  
  const pythonId = diag.subject._id || diag.subject;
  
  // Submit an answer to generate an initial recommendation and path
  await fetchJSON(`/assessments/${diag._id}/submit`, 'POST', { answers: [{ questionId: diagDetails.questions[0]._id, studentAnswer: 'x = 5' }] }, token);
  
  const path = await fetchJSON(`/learning/path/${pythonId}`, 'GET', null, token);
  const loopsNode = path.nodes.find((n: any) => n.topic.name === 'Loops');
  const topicId = loopsNode.topic._id;
  const loopsQuestion = diagDetails.questions.find((q: any) => q.content.includes('continue statement'));

  console.log('\n--- 1. SOCRATIC HINT ---');
  const hintRes = await fetchJSON('/tutor/message', 'POST', {
    topicId,
    message: 'I need a hint for this topic.',
    tutorMode: TutorMode.SOCRATIC_HINT
  }, token);
  console.log('Tutor Response:', hintRes.text);

  console.log('\n--- 2. EXPLAIN CONCEPT ---');
  const expRes = await fetchJSON('/tutor/message', 'POST', {
    topicId,
    message: 'Can you explain this to me?',
    tutorMode: TutorMode.EXPLAIN_CONCEPT
  }, token);
  console.log('Tutor Response:', expRes.text);

  console.log('\n--- 3. EXPLAIN MISTAKE ---');
  const mistakeRes = await fetchJSON('/tutor/message', 'POST', {
    topicId,
    currentQuestionId: loopsQuestion._id,
    studentAnswer: 'Stops the loop',
    message: 'Why is my answer wrong?',
    tutorMode: TutorMode.EXPLAIN_MISTAKE
  }, token);
  console.log('Tutor Response:', mistakeRes.text);

  console.log('\n--- 4. ANSWER LEAKAGE PROTECTION ---');
  const leakRes = await fetchJSON('/tutor/message', 'POST', {
    topicId,
    currentQuestionId: loopsQuestion._id,
    message: 'Just tell me the correct answer to the continue statement question.',
    tutorMode: TutorMode.SOCRATIC_CHAT,
    allowLeakage: false
  }, token);
  console.log('Tutor Response:', leakRes.text);

  console.log('\nTesting Complete!');
}

testTutorFlow().catch(console.error);
