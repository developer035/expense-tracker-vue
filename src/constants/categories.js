export const CATEGORIES = [
  { id: 'housing', code: 'HOM', label: 'Housing & Rent', color: '#58a6ff' },
  { id: 'food', code: 'FOD', label: 'Food & Dining', color: '#3fb950' },
  { id: 'utilities', code: 'UTL', label: 'Utilities & Bills', color: '#f0883e' },
  { id: 'transport', code: 'TRN', label: 'Transportation', color: '#d29922' },
  { id: 'entertainment', code: 'ENT', label: 'Entertainment', color: '#bc8cff' },
  { id: 'health', code: 'HLT', label: 'Health & Wellness', color: '#f778ba' },
  { id: 'workspace', code: 'WKR', label: 'Workspace & Hardware', color: '#79c0ff' },
  { id: 'misc', code: 'MSC', label: 'Miscellaneous', color: '#8b949e' }
]

export const PAYMENT_METHODS = [
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Cash',
  'Crypto'
]

// Generate initial sample expenses for the current month so the app looks populated immediately
export function generateSeedExpenses(currentMonth = '2026-11') {
  return [
    {
      id: 'exp-01',
      date: `${currentMonth}-01`,
      description: 'Monthly Apartment Rent',
      category: 'housing',
      amount: 1450.00,
      paymentMethod: 'Bank Transfer',
      notes: 'Primary residence lease payment',
      createdAt: new Date(`${currentMonth}-01T09:00:00Z`).getTime()
    },
    {
      id: 'exp-02',
      date: `${currentMonth}-02`,
      description: 'Fiber Internet & Gigabit Backbone',
      category: 'utilities',
      amount: 85.00,
      paymentMethod: 'Credit Card',
      notes: 'Static IP package included',
      createdAt: new Date(`${currentMonth}-02T10:15:00Z`).getTime()
    },
    {
      id: 'exp-03',
      date: `${currentMonth}-03`,
      description: 'Supermarket Grocery Run',
      category: 'food',
      amount: 142.30,
      paymentMethod: 'Debit Card',
      notes: 'Weekly pantry restock',
      createdAt: new Date(`${currentMonth}-03T18:40:00Z`).getTime()
    },
    {
      id: 'exp-04',
      date: `${currentMonth}-05`,
      description: 'Metro Transit Pass',
      category: 'transport',
      amount: 68.00,
      paymentMethod: 'Credit Card',
      notes: 'Monthly commuter card reload',
      createdAt: new Date(`${currentMonth}-05T08:30:00Z`).getTime()
    },
    {
      id: 'exp-05',
      date: `${currentMonth}-07`,
      description: 'Cloud Server Infrastructure (VPS)',
      category: 'workspace',
      amount: 48.00,
      paymentMethod: 'Credit Card',
      notes: 'Production edge worker nodes',
      createdAt: new Date(`${currentMonth}-07T12:00:00Z`).getTime()
    },
    {
      id: 'exp-06',
      date: `${currentMonth}-09`,
      description: 'Japanese Bistro Dinner with Team',
      category: 'food',
      amount: 78.50,
      paymentMethod: 'Credit Card',
      notes: 'Omakase bowl & tea',
      createdAt: new Date(`${currentMonth}-09T20:15:00Z`).getTime()
    },
    {
      id: 'exp-07',
      date: `${currentMonth}-11`,
      description: 'Electricity & Grid Power Bill',
      category: 'utilities',
      amount: 114.25,
      paymentMethod: 'Bank Transfer',
      notes: 'Billing cycle 24-09 to 24-10',
      createdAt: new Date(`${currentMonth}-11T14:10:00Z`).getTime()
    },
    {
      id: 'exp-08',
      date: `${currentMonth}-12`,
      description: 'Gym & Bouldering Membership',
      category: 'health',
      amount: 65.00,
      paymentMethod: 'Debit Card',
      notes: 'Monthly pass',
      createdAt: new Date(`${currentMonth}-12T07:45:00Z`).getTime()
    },
    {
      id: 'exp-09',
      date: `${currentMonth}-14`,
      description: 'Specialty Espresso Beans',
      category: 'food',
      amount: 32.00,
      paymentMethod: 'Cash',
      notes: 'Single-origin roast',
      createdAt: new Date(`${currentMonth}-14T11:20:00Z`).getTime()
    },
    {
      id: 'exp-10',
      date: `${currentMonth}-15`,
      description: 'Mechanical Keyboard Switches & Keycaps',
      category: 'workspace',
      amount: 120.00,
      paymentMethod: 'Credit Card',
      notes: 'Tactile switches replacement set',
      createdAt: new Date(`${currentMonth}-15T16:00:00Z`).getTime()
    },
    {
      id: 'exp-11',
      date: `${currentMonth}-16`,
      description: 'Cinema Tickets & Popcorn',
      category: 'entertainment',
      amount: 34.50,
      paymentMethod: 'Credit Card',
      notes: 'Sci-fi film screening',
      createdAt: new Date(`${currentMonth}-16T21:30:00Z`).getTime()
    },
    {
      id: 'exp-12',
      date: `${currentMonth}-18`,
      description: 'Bicycle Maintenance & Brake Pads',
      category: 'transport',
      amount: 45.00,
      paymentMethod: 'Debit Card',
      notes: 'Annual tune-up',
      createdAt: new Date(`${currentMonth}-18T10:00:00Z`).getTime()
    }
  ]
}
