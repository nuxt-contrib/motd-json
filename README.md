# motd-json

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Circle CI][circle-ci-src]][circle-ci-href]
[![Codecov][codecov-src]][codecov-href]

Library for retrieving a random motd from a json input with filter support

# Features

- validation of json against a JSON Schema
- filter motd's by region
- filter motd's by period / holidays
- filter motd's by custom tags

# Messages definition
```js
[
  {
    "message": <string>, // required, the message of the day
    "regions": [<string>], // optional, the regions/territories to show this message for
    "periods": [{ // optional, use 0000 as year for a yearly recurring period
      "from": <date-time>, // the start date-time this message could be shown
      "till": <date-time> // the end date-time this message could be shown
    }],
    "tags": { // optional
      {
        "name": <string>,
        "type": ["semver", "number", "boolean", "set"],
        "value":
          <string> // for semver
          <number> // for number, matches only equal or greater than
          <boolean> // for boolean
          Array<any> // for set
    }
  }
]
```

For easy validation a JSON Schema and validate export is included:

> The peer dependency ajv needs to be installed for validate to work

```js
import { validate } from 'motd-json'
import yourMessages from './your-messages.json'

await validate(yourMessages) // resolves to true or false
```

# Options

> These are the options you could pass to the `motd` export for retrieving a message

- `region` _string_
- `regional` _boolean_

If _region_ is empty and _regional_ is true, the users region is determined from the territory string of their os locale using [`os-locale`](https://github.com/sindresorhus/os-locale)

Messages are matched when they either dont list any region or the user region is included in the list of regions for a message

- `date` _string_

If not empty then only messages are matched that either dont have a period listed or where the provided date falls within the configured period for the message

- `tags` _object_

A key/value mapping of tag values for the current user. If a message contains a list of tags, then the name of those tags is used as key to lookup the value.
The mapped value is then compared to the message tag values to determine whether the message should be included or not

# Usage

### Basic with validation

```js
import { motd, validate } from 'motd-json'
import messages from './my-messages.json'

if (validate(messages)) {
  const options = {
    regional: true,
    tags: {
      typescript: false,
      version: 'v2.2.3',
      modules: ['axios', 'i18n']
    }
  }

  console.log(motd(messages, options))
}
```

### Create a motd generator

```js
import { filter, motd } from 'motd-json'
import messages from './my-messages.json'

const options = {
  regional: true,
  tags: {
    typescript: false,
    version: 'v2.2.3',
    modules: ['axios', 'i18n']
  }
}

const filteredMessages = filter(messages, options)
const motdGenerator = () => motd(filteredMessages)

motdGenerator()
motdGenerator()
```


# Example messages

```js
// messages.json
[
  {
    message: 'some message'
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
    message: 'Happy New Year',
    periods: [{
      from: '0000-12-28',
      till: '0000-12-31'
    }, {
      from: '0000-01-01',
      till: '0000-01-05'
    }]
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
  },
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
      },
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
```
# TODO

- [ ] Add support for different comparison operators for tags

# License

MIT

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/motd-json/latest.svg?style=flat-square
[npm-version-href]: https://npmjs.com/package/motd-json

[npm-downloads-src]: https://img.shields.io/npm/dt/motd-json.svg?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/motd-json

[circle-ci-src]: https://img.shields.io/circleci/project/github/jsless/motd-json.svg?style=flat-square
[circle-ci-href]: https://circleci.com/gh/jsless/motd-json

[codecov-src]: https://img.shields.io/codecov/c/github/jsless/motd-json.svg?style=flat-square
[codecov-href]: https://codecov.io/gh/jsless/motd-json
