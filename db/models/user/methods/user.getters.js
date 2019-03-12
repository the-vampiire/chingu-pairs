/**
 * Access the User's registration status
 * - checks if discord and service registrations are complete
 * - service fields: skill_level, timezone, availability
 * @returns {{ discord: boolean, service: boolean }} 
 */
function registrationStatus() {
  const serviceFields = ['skill_level', 'timezone', 'availability'];
  return {
    discord: this.discord_id !== null,
    service: serviceFields.every(field => this[field] !== null),
  }
}

module.exports = {
  registrationStatus,
};
