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

async function testCoreLoop() {
  console.log('============================================================');
  console.log('CORE ADAPTIVE LOOP END-TO-END TEST');
  console.log('============================================================\n');

  // STEP 1 & 2: Initial State and Recommendation
  console.log('--- STEP 1 & 2: LOGIN STUDENT A & VERIFY INITIAL STATE ---');
  const loginA = await fetchJSON('/auth/login', 'POST', { email: 'student@example.com', password: 'password123' });
  const tokenA = loginA.token;
  
  let analyticsA = await fetchJSON('/analytics/student', 'GET', null, tokenA);
  console.log(`Student: ${loginA.user.name}`);
  const loopsInitial = analyticsA.mastery.find((m: any) => m.topic.name === 'Loops');
  console.log(`Initial Loops Mastery: ${loopsInitial.score} (${loopsInitial.level})`);
  console.log(`Active Recommendation: ${analyticsA.activeRecommendation.actionType} ${analyticsA.activeRecommendation.recommendedTopic.name}`);
  console.log(`Reason: ${analyticsA.activeRecommendation.reason}\n`);

  // STEP 3 & 4: Assessment and Learning Session
  console.log('--- STEP 3 & 4: OPEN TOPIC & START LEARNING SESSION ---');
  const assessments = await fetchJSON('/assessments', 'GET', null, tokenA);
  const practiceAssessment = assessments.find((a: any) => a.title === 'Loops Practice Assessment');
  
  const session = await fetchJSON('/learning/sessions', 'POST', { topicId: loopsInitial.topic._id }, tokenA);
  console.log(`Started Learning Session ID: ${session._id}`);

  // STEP 5: Practice / Assessment
  console.log('--- STEP 5: SUBMITTING PRACTICE ASSESSMENT ---');
  // We simulate Student A learning and answering correctly to improve mastery.
  const assessmentDetails = await fetchJSON(`/assessments/${practiceAssessment._id}`, 'GET', null, tokenA);
  const answers = assessmentDetails.questions.map((q: any) => {
    // We happen to know the correct answers for this seed:
    let studentAnswer = '';
    if (q.content.includes('output')) studentAnswer = '0 1 2';
    else if (q.content.includes('Which loop is best')) studentAnswer = 'while';
    else studentAnswer = 'Inner loop stops';
    return { questionId: q._id, studentAnswer, timeSpent: 30 };
  });

  const submitRes = await fetchJSON(`/assessments/${practiceAssessment._id}/submit`, 'POST', { answers }, tokenA);
  console.log(`Assessment Submitted. Score: ${submitRes.score}%`);
  
  await fetchJSON(`/learning/sessions/${session._id}/end`, 'POST', { selfReportedDifficulty: 2 }, tokenA);

  // STEP 6-11: Verify Recalculation
  console.log('\n--- STEP 6-11: VERIFY MASTERY, PATH & RECOMMENDATION RECALCULATION ---');
  analyticsA = await fetchJSON('/analytics/student', 'GET', null, tokenA);
  const loopsFinal = analyticsA.mastery.find((m: any) => m.topic.name === 'Loops');
  console.log(`NEW Loops Mastery: ${loopsFinal.score} (${loopsFinal.level})`);
  
  console.log(`NEW Active Recommendation: ${analyticsA.activeRecommendation.actionType} ${analyticsA.activeRecommendation.recommendedTopic.name}`);
  console.log(`NEW Reason: ${analyticsA.activeRecommendation.reason}`);

  // Fetch Path
  const subjectId = loopsFinal.topic.subject;
  const pathData = await fetchJSON(`/learning/path/${subjectId}`, 'GET', null, tokenA);
  const loopsNode = pathData.nodes.find((n: any) => n.topic.name === 'Loops');
  const functionsNode = pathData.nodes.find((n: any) => n.topic.name === 'Functions');
  console.log(`Path Node - Loops State: ${loopsNode.state}`);
  console.log(`Path Node - Functions State: ${functionsNode.state}\n`);

  // STEP 12: Student Differentiation Test
  console.log('--- STEP 12: STUDENT B DIFFERENTIATION TEST ---');
  const loginB = await fetchJSON('/auth/login', 'POST', { email: 'studentB@example.com', password: 'password123' });
  const tokenB = loginB.token;
  
  const analyticsB = await fetchJSON('/analytics/student', 'GET', null, tokenB);
  console.log(`Student: ${loginB.user.name}`);
  const loopsB = analyticsB.mastery.find((m: any) => m.topic.name === 'Loops');
  const oopB = analyticsB.mastery.find((m: any) => m.topic.name === 'OOP');
  console.log(`Loops Mastery: ${loopsB.score} (${loopsB.level})`);
  console.log(`OOP Mastery: ${oopB.score} (${oopB.level})`);
  
  // Trigger learning path update to generate recommendations
  await fetchJSON(`/learning/path/${loopsB.topic.subject}`, 'GET', null, tokenB);
  
  const updatedAnalyticsB = await fetchJSON('/analytics/student', 'GET', null, tokenB);
  console.log(`Active Recommendation: ${updatedAnalyticsB.activeRecommendation.actionType} ${updatedAnalyticsB.activeRecommendation.recommendedTopic.name}`);
  console.log(`Reason: ${updatedAnalyticsB.activeRecommendation.reason}`);
}

testCoreLoop().catch(console.error);
