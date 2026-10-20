// What the Library Game Hub shows about YOUR game (Hub Contract, rule 1).
// Lab Step 6: replace every CHANGE_ME value with your own.
const pkg = require('../../package.json');

module.exports = {
  slug: 'board-wars',
  name: 'Board Wars',
  team: 'Team 11 (BSCS 3-2)',
  developer: 'JaywardGodalle',
  description: 'A multiplayer quiz strategy game with hidden teams and board movement.',
  min_players: 2,
  max_players: 30,
  version: pkg.version,         // read from package.json, do not edit here
};
