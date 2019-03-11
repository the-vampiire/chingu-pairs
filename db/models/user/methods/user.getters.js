/**
 * Access the User's registration status
 * - checks if discord and service registrations are complete
 * @returns {{ discord: boolean, service: boolean }} 
 */
function registrationStatus() {
  const serviceFields = ['rank', 'timezone', 'availability'];

  return {
    discord: this.discord_id !== null,
    service: serviceFields.every(field => this[field] !== null),
  }
}

module.exports = {
  registrationStatus,
};
