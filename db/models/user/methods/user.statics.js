/**
 * Gets or creates a User through Github data
 * - existing user: updates email and username (if changed)
 * @param {object} githubUserData { github_id, username, email }
 * @returns {User} success: user
 * @returns {null} failure during creation: null
 */
async function githubGetOrCreate(githubUserData) {
  const { github_id } = githubUserData;

  const existingUser = this.findOne({ where: { github_id } });
  if (existingUser) {
    await existingUser.update({ ...githubUserData });
    return existingUser;
  }

  try {
    return this.create({ ...githubUserData });
  } catch(error) {
    console.error(error);
    return null;
  }
}

module.exports = {
  githubGetOrCreate,
};
