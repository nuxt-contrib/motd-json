import osLocale from 'os-locale'
import semver from 'semver'
import schema from '../src/schema'

export function getRegion() {
  return osLocale.sync({ spawn: false })
    .substr(3, 2)
    .toLowerCase()
}

export function filterPeriod(data, now) {
  if (now && typeof now === 'string') {
    now = new Date(now)
  }

  now = now || new Date().getTime()
  const currentYear = `${new Date().getFullYear()}-`

  return data.filter(({ period: { from, till } = {} }) => {
    if (from && till) {
      from = new Date(from.replace('0000-', currentYear)).getTime()
      till = new Date(till.replace('0000-', currentYear)).getTime()

      return now >= from && now <= till
    }

    return true
  })
}

export function filterRegional(data, region) {
  if (region) {
    region = region.toLowerCase()
  } else {
    region = getRegion()
  }

  return data.filter(({ regions }) => !regions || regions.includes(region))
}

export function filterTags(data, tags) {
  if (!tags) {
    return data
  }

  return data.filter(({ tags: dataTags }) => {
    if (!dataTags) {
      return true
    }

    return dataTags.every(({ name, type, value }) => {
      if (!(name in tags)) {
        return true
      }

      const tagValue = tags[name]

      if (type === 'semver') {
        return semver.satisfies(tagValue, value)
      }

      if (type === 'number') {
        // TODO: make operator optionsurable
        return tagValue >= value
      }

      if (type === 'set') {
        if (Array.isArray(tagValue)) {
          return tagValue.some(aTagValue => value.includes(aTagValue))
        }
        return value.includes(tagValue)
      }

      if (type === 'boolean') {
        return value === tagValue
      }
    })
  })
}

export function filter(data, options) {
  const {
    region = '',
    regional = false,
    date = '',
    tags = false
  } = options || {}

  if (regional || region) {
    data = filterRegional(data, region)
  }

  if (date) {
    data = filterPeriod(data, date)
  }

  if (tags) {
    data = filterTags(data, tags)
  }

  return data
}

let ajvValidate

export async function validate(data) {
  if (!ajvValidate) {
    try {
      const Ajv = await import('ajv').then(m => m.default || m)
      ajvValidate = new Ajv().compile(schema)
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND') {
        console.error('ajv not found, please install the peer dependency') // eslint-disable-line no-console
        return true
      }

      throw err
    }
  }

  return ajvValidate(data)
}

export function motd(data, options) {
  const motds = filter(data, options)

  const index = Math.floor(Math.random() * motds.length)

  const { message } = motds[index]
  return message || ''
}
