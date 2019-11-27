import osLocale from 'os-locale'
import * as motd from '../src'

jest.mock('os-locale', () => ({
  sync: jest.fn()
}))

const data = [
  {
    message: 'my test message'
  },
  {
    message: 'my multi-region message',
    regions: ['en', 'nl']
  },
  {
    message: 'mijn test bericht',
    regions: ['nl']
  },
  {
    message: 'Merry Christmas',
    period: {
      from: '0000-12-01',
      till: '0000-12-27'
    }
  },
  {
    message: 'Fijne Sinterklaas',
    regions: ['nl'],
    period: {
      from: '2019-11-16',
      till: '2019-12-05'
    }
  }
]

describe('motd', () => {
  beforeEach(() => {
    osLocale.sync.mockReturnValue('nl-NL')
  })

  afterEach(() => {
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })

  test('schema', async () => {
    await expect(motd.validate(data)).resolves.toBe(true)
  })

  test('getRegion only returns region part from locale', () => {
    expect(motd.getRegion()).toBe('nl')

    osLocale.sync.mockReturnValue('en_UK')
    expect(motd.getRegion()).toBe('uk')
  })

  test('filterPeriod returns motds for current period only', () => {
    let now = new Date('2019-11-20')
    expect(motd.filterPeriod(data, now)).toMatchSnapshot()

    now = new Date('2019-12-01')
    expect(motd.filterPeriod(data, now)).toMatchSnapshot()

    now = new Date('2019-12-10')
    expect(motd.filterPeriod(data, now)).toMatchSnapshot()
  })

  test('filterRegional only returns motds for current region', () => {
    expect(motd.filterRegional(data)).toMatchSnapshot()
    expect(motd.filterRegional(data, 'en')).toMatchSnapshot()
    expect(motd.filterRegional(data, 'fr')).toMatchSnapshot()
  })

  test('filterMotds returns all', () => {
    expect(motd.filter(data, { date: '2019-12-01' })).toMatchSnapshot()
  })

  test('motd returns message', () => {
    const options = {
      region: 'fr',
      date: '2019-01-01',
      tags: {}
    }

    expect(motd.filter(data, options)).toMatchSnapshot()
    expect(motd.motd(data, options)).toBe('my test message')
  })
})
