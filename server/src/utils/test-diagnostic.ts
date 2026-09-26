import mongoose from 'mongoose';
import dotenv from 'dotenv';

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

async function testDiagnosticFlow() {
  console.log('============================================================');
  console.log('DIAGNOSTIC FLOW END-TO-END TEST');
  console.log('============================================================\n');

  // STEP 1: Register New Student
  const email = `newstudent_${Date.now()}@example.com`;
  console.log(`Registering new student: ${email}`);
  const reg = await fetchJSON('/auth/register', 'POST', { email, password: 'password123', name: 'Diagnostic Student', role: 'STUDENT' });
  const token = reg.token;
  
  // STEP 2: Fetch Diagnostic
  console.log('Fetching diagnostic assessments...');
  const assessments = await fetchJSON('/assessments', 'GET', null, token);
  const diag = assessments.find((a: any) => a.isDiagnostic);
  console.log(`Found Diagnostic: ${diag.title}`);
  
  const diagDetails = await fetchJSON(`/assessments/${diag._id}`, 'GET', null, token);

  // STEP 3: Submit Diagnostic Answers
  // Let's get Vars correct, Cond and Loops incorrect.
  const answers = diagDetails.questions.map((q: any) => {
    let studentAnswer = 'wrong';
    if (q.content.includes('assign the value')) studentAnswer = 'x = 5'; // correct
    return { questionId: q._id, studentAnswer, timeSpent: 20 };
  });

  console.log('Submitting Diagnostic Answers...');
  await fetchJSON(`/assessments/${diag._id}/submit`, 'POST', { answers }, token);

  // STEP 4: Verify Intelligence & Path Update
  console.log('Fetching Analytics after Diagnostic...');
  const analytics = await fetchJSON('/analytics/student', 'GET', null, token);
  
  // We expect Vars to be MASTERED/DEVELOPING, Cond/Loops to be WEAK.
  console.log(`Mastery Records count: ${analytics.mastery.length}`);
  analytics.mastery.forEach((m: any) => {
    console.log(`Topic: ${m.topic?.name || 'Objective'}, Score: ${m.score}, Level: ${m.level}`);
  });

  console.log('\nKnowledge Gaps (Misconceptions):');
  console.log(analytics.profile.detectedMisconceptions);

  console.log('\nActive Recommendation:');
  console.log(`${analytics.activeRecommendation.actionType} ${analytics.activeRecommendation.recommendedTopic.name}`);
  console.log(`Reason: ${analytics.activeRecommendation.reason}`);

  // STEP 5: Verify Path
  const subjectId = diag.subject._id || diag.subject;
  const path = await fetchJSON(`/learning/path/${subjectId}`, 'GET', null, token);
  console.log('\nLearning Path Nodes:');
  path.nodes.forEach((n: any) => {
    console.log(`- ${n.topic.name}: ${n.state}`);
  });
  
}

testDiagnosticFlow().catch(console.error);
