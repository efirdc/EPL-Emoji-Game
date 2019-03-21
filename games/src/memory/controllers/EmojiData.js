export default
{
  sequence: [
    '👶', '🐵', '🐷', '🤢', '🍼', '🐶', '😺', '🥶', '🔥', '⏱',
    '🧟‍', '🧠', '🤵', '👰', '🤓', '🍬', '💩', '🤑', '😈', '🧙‍',
    '😱', '💵', '🥓', '⛄', '🐦', '🦂', '🐍', '🤡', '👻', '⚡',
    '👽', '🛸', '🧛‍', '🦇', '🤒', '👩‍⚕️', '🦁', '🤖', '⛄', '🧞‍',
    '👩‍🍳', '🍅', '🥦', '🥔', '🥕', '🥑', '🍆', '🥥', '💪', '💥',
    '👨‍🚀', '🌌', '🚀', '👺', '🎅', '🤯', '👩‍🎤', '🎷', '🎸', '🎺',
    '🎻', '🥁', '👮', '🍩', '👨‍🚒', '💎', '👌', '👀', '👄', '💯',
    '🌎', '🍄', '🌷', '🍪', '🏈', '⚽', '⚾', '🎂', '🌈', '🍔',
  ],

  filler: [
    '🌲', '🌴', '🍂', '🍄', '🌷', '🌻', '💯', '🌈', '👠', '🌎',
    '🎂', '🍔', '🍕', '🍟', '🍣', '🍦', '🍪', '🏈', '⚽', '⚾',
    '💎', '👌', '👀', '👄',
  ],

  comboBonusWith: {
    '🧟‍': ['🧠'],
    '🧛‍': ['🦇'],
    '🤑': ['💵'],
    '👶': ['🎅', '🍬', '🍼'],
    '🤵': ['👰'],
    '👩‍🍳': ['🍅', '🥦', '🥔', '🥕', '🥑', '🍆', '🥓', '🥥'],
    '👮': ['🍩'],
    '🛸': ['👽'],
    '👨‍🚒': ['🔥'],
    '👩‍⚕️': ['🤢', '🤒'],
    '👨‍🚀': ['🌌', '🚀'],
    '🤯': ['🌌'],
    '👩‍🎤': ['🎷','🎸','🎺','🎻','🥁'],
  },

  afraidOf: {
    '😺': ['🐶', '🦁'],
    '🐶': ['🦁'],
    '🐷': ['🥓', '🦁'],
    '🥶': ['🔥'],
    '⛄': ['🔥'],
    '🐵': ['🦂', '🐍', '🦁'],
    '🐦': ['🐍', '🦁'],
    '😱': [
      '😈', '👻', '👺', '👽', '🤖', '🤡', '🦂', '🐍', '🦁', '🧟‍',
      '🛸', '🦇', '🧛‍'],
    '👶': ['🤡'],
    '🤓': ['💪'],
    '🤢': ['💩', '🥦'],
  },

  specials: [
    '⏱', // Matching adds to the timer
    '🧞‍', // Flips card randomly
    '🧙‍', // Adds a concurrent flip
    '🔥', // burns adjacent cards while held face up
    '⚡', // shocks a card on face up
    '💥', // cards fly away on face up
    '😈', // Gets stuck up, does bad things until you match him
  ],

  comboBonusSounds: {
    '🧟‍': 'someFileName.mp3',
    '🧛‍': 'someFileName.mp3',
    '🤑': 'someFileName.mp3',
    '👶': 'someFileName.mp3',
    '🤵': 'someFileName.mp3',
    '👩‍🍳': 'someFileName.mp3',
    '👮': 'someFileName.mp3',
    '🛸': 'someFileName.mp3',
    '👨‍🚒': 'someFileName.mp3',
    '👩‍⚕️': 'someFileName.mp3',
    '👨‍🚀': 'someFileName.mp3',
    '🤯': 'someFileName.mp3',
    '👩‍🎤': 'someFileName.mp3',
  },

  afraidOfSounds: {
    '😺': 'someFileName.mp3',
    '🐶': 'someFileName.mp3',
    '🐷': 'someFileName.mp3',
    '🥶': 'someFileName.mp3',
    '⛄': 'someFileName.mp3',
    '🐵': 'someFileName.mp3',
    '🐦': 'someFileName.mp3',
    '😱': 'someFileName.mp3',
    '👶': 'someFileName.mp3',
    '🤓': 'someFileName.mp3',
    '🤢': 'someFileName.mp3',
  },

  specialsSounds: {
    '⏱': 'someFileName.mp3',
    '🧞‍': 'someFileName.mp3',
    '🧙‍': 'someFileName.mp3',
    '🔥': 'someFileName.mp3',
    '⚡': 'someFileName.mp3',
    '💥': 'someFileName.mp3',
    '😈': 'someFileName.mp3',
  },
}
