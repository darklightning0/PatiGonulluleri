// Notification scheduler disabled
// Previously this worker sent per-pet filtered emails to subscribers.
// Requirement changed: we no longer send pet-filtered individual mails.
// Keep a minimal worker so scheduled deployments remain valid. If you
// want to re-enable automatic notifications later, restore from git
// history and adapt to the new broadcast-based workflow.

export default {
  async scheduled(event, env, ctx) {
    console.log('notification-scheduler: disabled - no per-pet emails will be sent');
    return new Response(JSON.stringify({ message: 'no-op' }), { status: 200 });
  }
};