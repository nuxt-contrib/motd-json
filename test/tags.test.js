import * as motd from '../src'

const data = [
  {
    message: 'You are using v2.x',
    tags: [
      {
        name: 'version',
        type: 'semver',
        value: 'v2.x'
      }
    ]
  },
  {
    message: 'You are using v3.x',
    tags: [
      {
        name: 'version',
        type: 'semver',
        value: 'v3.x'
      }
    ]
  },
  {
    message: 'You are using 10 modules or more',
    tags: [
      {
        name: 'modulesCount',
        type: 'number',
        value: 10
      }
    ]
  },
  {
    message: 'You are using the axios or http module',
    tags: [
      {
        name: 'modules',
        type: 'set',
        value: ['axios', 'http']
      }
    ]
  },
  {
    message: 'You are using typescript',
    tags: [
      {
        name: 'typescript',
        type: 'boolean',
        value: true
      }
    ]
  }
]

describe('motd', () => {
  test('schema', async () => {
    await expect(motd.validate(data)).resolves.toBe(true)
  })

  test('filterTags doesnt filter without tags specified', () => {
    const filteredMotds = motd.filterTags(data)

    expect(filteredMotds.length).toBe(5)
    expect(filteredMotds).toMatchSnapshot()
  })

  test('filterTags doesnt filter when data has no tags', () => {
    const data = [
      { message: 'my test message' }
    ]
    const filteredMotds = motd.filterTags(data, {
      version: 'v2.x'
    })

    expect(filteredMotds.length).toBe(1)
    expect(filteredMotds).toMatchSnapshot()
  })

  test('filterTags filters everything', () => {
    const filteredMotds = motd.filterTags(data, {
      version: 'v1.x',
      modulesCount: 1,
      modules: '',
      typescript: false
    })

    expect(filteredMotds.length).toBe(0)
  })

  test('filterTags filters semver', () => {
    const filteredMotds = motd.filterTags(data, {
      version: 'v2.0.1'
    })

    expect(filteredMotds).toEqual(expect.arrayContaining([
      expect.objectContaining({
        message: 'You are using v2.x'
      })
    ]))

    expect(filteredMotds).toEqual(expect.not.arrayContaining([
      expect.objectContaining({
        message: 'You are using v3.x'
      })
    ]))
  })

  test('filterTags filters semver', () => {
    const filteredMotds = motd.filterTags(data, {
      version: 'v3.0.1'
    })

    expect(filteredMotds).toEqual(expect.not.arrayContaining([
      expect.objectContaining({
        message: 'You are using v2.x'
      })
    ]))

    expect(filteredMotds).toEqual(expect.arrayContaining([
      expect.objectContaining({
        message: 'You are using v3.x'
      })
    ]))
  })

  test('filterTags filters boolean', () => {
    const filteredMotds = motd.filterTags(data, {
      typescript: true
    })

    expect(filteredMotds).toEqual(expect.arrayContaining([
      expect.objectContaining({
        message: 'You are using typescript'
      })
    ]))
  })

  test('filterTags filters set', () => {
    const filteredMotds = motd.filterTags(data, {
      modules: ['axios', 'i18n']
    })

    expect(filteredMotds).toEqual(expect.arrayContaining([
      expect.objectContaining({
        message: 'You are using the axios or http module'
      })
    ]))
  })
})
