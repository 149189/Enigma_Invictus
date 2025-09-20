// src/services/aiService.js

const AI_BASE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

export async function triggerAutoVerification({ confidenceThreshold = 0.5, dryRun = false } = {}) {
  try {
    const res = await fetch(`${AI_BASE_URL}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confidence_threshold: confidenceThreshold, dry_run: dryRun })
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`AI /verify failed: ${res.status} ${res.statusText} ${text}`);
    }

    return await res.json();
  } catch (err) {
    console.error('[AI] triggerAutoVerification error:', err.message);
    return null;
  }
}

export async function verifyProjectById(projectId, { dryRun = false } = {}) {
  try {
    const res = await fetch(`${AI_BASE_URL}/verify/project/${projectId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dry_run: dryRun })
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`AI /verify/project failed: ${res.status} ${res.statusText} ${text}`);
    }

    return await res.json();
  } catch (err) {
    console.error('[AI] verifyProjectById error:', err.message);
    return null;
  }
}
