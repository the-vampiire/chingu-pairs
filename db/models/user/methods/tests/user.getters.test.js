const { registrationStatus } = require('../user.getters');

const completedFields = {
  timezone: 5,
  skill_level: 'vanilla',
  availability: 'any',
  registrationStatus,
};

const incompleteFields = {
  timezone: null,
  skill_level: null,
  availability: 'any',
  registrationStatus,
};

describe('User getter methods', () => {
  describe('registrationStatus: checks discord and service registration statuses', () => {
    test('service incomplete, discord incomplete: returns { discord: false, service: false }', () => {
      const user = { ...incompleteFields, discord_id: null };

      const output = user.registrationStatus();
      expect(output).toEqual({ discord: false, service: false });
    });

    test('service incomplete, discord complete: returns { discord: true, service: false }', () => {
      const user = { ...incompleteFields, discord_id: 5 };

      const output = user.registrationStatus();
      expect(output).toEqual({ discord: true, service: false });
    });

    test('service complete, discord incomplete: returns { discord: false, service: true }', () => {
      const user = { ...completedFields, discord_id: null };

      const output = user.registrationStatus();
      expect(output).toEqual({ discord: false, service: true });
    });

    test('service and discord complete: returns { discord: true, service: true }', () => {
      const user = { ...completedFields, discord_id: 5 };

      const output = user.registrationStatus();
      expect(output).toEqual({ discord: true, service: true });
    });
  });
});
