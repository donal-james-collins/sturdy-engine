const entities = require('../../../models/game/entities')

module.exports = {
  game: {
    tiles: [
      [4, 1],
      [4, 1],
      [4, 1],
      [4, 1],
      [4, 1],
      [4, 1],
      [4, 1],
      [4, 1],
      [4, 1],
      [4, 1],
      [4, 1],
      [4, 3]
    ],

    entities: [
      entities.robot({ x: 0, y: 0, id: 'ROBOT' })
    ]
  },

  editor: {
    workspace: '<xml xmlns="http://www.w3.org/1999/xhtml"></xml>',

    toolbox: `
      <xml id="toolbox" style="display: none">
        <category name="Loops" colour="100">
          <block type="controls_repeat"></block>
        </category>

        <sep gap="8"></sep>
        
        <category name="Movement" colour="40">
          <block type="move"></block>
          <block type="rotate"></block>
        </category>
      </xml>
    `
  },

  label: 'Simple loops',

  goals: [
    {
      type: 'moveTo',
      params: { position: { x: 1, y: 11 }, entity: 'ROBOT' },
      desc: 'Move Morty to the grass',
      isMandatory: true
    },
    {
      type: 'maxBlocks',
      params: { amount: 4 },
      desc: 'Use at most 4 blocks',
      isMandatory: false
    }
  ],

  storyModal: {
    text: 'Looks like we need a lot of blocks to get to the grass field Morty. Good thing I added a new repeat block which let\'s the robot do commands multiple times.',
    hint: 'You can also do this without the repeat block.',
    img: '../../assets/img/tutorials/simple-loops.png'
  },

  nextTutorial: 'nested-loops-1'
}
