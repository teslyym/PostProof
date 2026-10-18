export const SEGMENTS = [
  { label: 'State', length: 2, allowed: /[A-Z]/g, numeric: false, example: 'EK' },
  { label: 'LGA', length: 2, allowed: /[0-9]/g, numeric: true, example: '01' },
  { label: 'District', length: 3, allowed: /[A-Z0-9]/g, numeric: false, example: 'A03' },
  { label: 'Area', length: 2, allowed: /[A-Z]/g, numeric: false, example: 'FK' },
  { label: 'Building', length: 2, allowed: /[0-9]/g, numeric: true, example: '01' },
]

export const EMPTY_PARTS = ['', '', '', '', '']

export function cleanSegment(value, index) {
  const { allowed, length } = SEGMENTS[index]
  return (value.toUpperCase().match(allowed) || []).join('').slice(0, length)
}

export function splitCode(raw) {
  const flat = raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (flat.length !== 11) return null

  const parts = []
  let at = 0
  for (const segment of SEGMENTS) {
    parts.push(flat.slice(at, at + segment.length))
    at += segment.length
  }
  return parts.every((part, i) => cleanSegment(part, i) === part) ? parts : null
}

export const joinParts = (parts) => parts.join('-')

export const isComplete = (parts) => parts.every((part, i) => part.length === SEGMENTS[i].length)

export const CLAIMS = [
  {
    id: 'valid',
    title: 'The postcode exists',
    detail: 'Confirms the code belongs to a real, active building.',
    short: 'Exists',
    ask: () => 'The postcode is real and active',
    yes: () => 'This postcode is real and active.',
    no: () => 'This postcode is not in the register.',
  },
  {
    id: 'lga_match',
    title: 'It is in the expected LGA',
    detail: 'A yes or no answer. The LGA itself is never returned.',
    short: 'In LGA',
    ask: (lga) => `The building is in ${lga}`,
    yes: (lga) => `The building is in ${lga}.`,
    no: (lga) => `The building is not in ${lga}.`,
  },
  {
    id: 'residential',
    title: 'The building is residential',
    detail: 'A yes or no answer about how the building is used.',
    short: 'Residential',
    ask: () => 'The building is a home',
    yes: () => 'The building is residential.',
    no: () => 'The building is not confirmed as residential.',
  },
]

export const ALL_CLAIMS = CLAIMS.map((claim) => claim.id)

export const WITHHELD = [
  'Street or house address',
  'Locality and zone',
  'Building details',
  'Coordinates',
]

const MADE_UP = { name: 'Made-up code', code: 'ZZ-99-Z99-ZZ-99', lga: 'Ado Ekiti' }

export function samplesFor(source) {
  if (source === 'nipost-sandbox') {
    return [
      { name: 'Sandbox building', code: 'FC-01-A01-KP-27', lga: '', claims: ['valid', 'residential'] },
      { name: 'Another sandbox building', code: 'FC-01-A01-LR-01', lga: '', claims: ['valid', 'residential'] },
      MADE_UP,
    ]
  }
  return [
    { name: 'Residential, Ekiti', code: 'EK-01-A03-FK-01', lga: 'Ado Ekiti' },
    { name: 'Public building, Abuja', code: 'FC-02-A09-DB-09', lga: 'Abuja Municipal' },
    MADE_UP,
  ]
}