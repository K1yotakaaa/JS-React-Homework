export const STATUSES = ['Recruit', 'Active', 'Injured', 'Legendary']

export const CLASS_ICON = {
	Warrior: '⚔️',
	Mage: '🧙',
	Rogue: '🗡️',
	Ranger: '🏹',
	Healer: '✨',
}

export const seedCharacters = [
	{
		id: 'c1',
		name: 'Thalric Stormbane',
		class: 'Warrior',
		level: 12,
		status: 'Active',
		resetCount: 0,
	},
	{
		id: 'c2',
		name: 'Nyra Duskwhisper',
		class: 'Rogue',
		level: 9,
		status: 'Injured',
		resetCount: 0,
	},
	{
		id: 'c3',
		name: 'Seraphine Lightbringer',
		class: 'Healer',
		level: 15,
		status: 'Legendary',
		resetCount: 0,
	},
	{
		id: 'c4',
		name: 'Pip Quickfoot',
		class: 'Ranger',
		level: 5,
		status: 'Recruit',
		resetCount: 0,
	},
	{
		id: 'c5',
		name: 'Magnus Emberfall',
		class: 'Mage',
		level: 20,
		status: 'Legendary',
		resetCount: 0,
	},
]

export const STATUS_ICON = {
	Recruit: '🔰',
	Active: '🟢',
	Injured: '⚠️',
	Legendary: '👑',
}