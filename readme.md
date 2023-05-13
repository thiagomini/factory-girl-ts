# Philosophy

factory-girl-ts is a library based on the Node.js version of factory_bot: [factory-girl](https://www.npmjs.com/package/factory-girl), which has no updates since 2018. The main goal of `factory-girl-ts` is to provide an easy API to create test data, especially with associations, and native support for Typescript. It was also inspired by [fishery](https://github.com/thoughtbot/fishery), which is a modern alternative of the old `factory-girl`.

Currently, this library supports the following ORMs:

- [Sequelize](https://sequelize.org/)
- [Typeorm](https://typeorm.io/)

## Features

- Simple and intuitive API for defining and creating test data
- Integration with Sequelize and TypeORM for seamless usage with these ORMs
- Supports building and creating models with associations
- Works with both Repository and Active Record patterns

## Installation

You can install Factory Girl TypeScript using npm:

```bash
npm install factory-girl-ts
```

## Usage

Factories are instances of the [Factory](./src/factory.ts) class, which provides the following methods:

- `build(override?)`: builds the target object, with an optional `override` parameter
- `buildMany(override?)`: builds an array of the target object
- `async create(override)`: creates an instance of the target object
- `async createMany(override)`: creates an array of instances of the target object

Let's see how to define a factory and use each of the methods above

### Defining and using a basic factory (Sequelize)

```ts
import { User } from './models/user';
import { FactoryGirl, SequelizeAdapter } from 'factory-girl-ts';

// First, we have to specify which adapter we want to use. Each ORM has its own adapter.
FactoryGirl.setAdapter(new SequelizeAdapter());

// Then, we define our factory
const defaultAttributesFactory = () => ({
  name: 'John',
  email: 'some-email@mail.com',
  address: {
    state: 'Some state',
    country: 'Some country',
  },
});
const userFactory = new FactoryGirl(User, defaultAttributesFactory);

// Now, we can use it to build or create instances of the target object
const defaultUser = userFactory.build();
console.log(defaultUser);
// { name: 'John', email: 'some-email@mail.com', state: 'Some state', country: 'Some country' }

// We can also override default properties
const userWithCustomName = userFactory.build({ name: 'Jane' });
console.log(userWithCustomName);
// { name: 'Jane', email: 'some-email@mail.com', 'Some state', country: 'Some country' }

// Overriding nested properties is also possible
const userWithCustomAddress = userFactory.build({
  address: { state: 'Another state' },
});
console.log(userWithCustomAddress);
// { name: 'John', email: 'some-email@mail', state: 'Another state', country: 'Some country' }
```

### Building many instances

We can also build many instances of the target object at once:

```ts
const defaultAttributesFactory = () => ({
  name: 'John',
  email: 'some-email@mail.com',
});
const userFactory = new FactoryGirl(User, defaultAttributesFactory);

const users = userFactory.buildMany(2);
// [ { name: 'John', email: 'some-email@mail.com' }, { name: 'John', email: 'some-email@mail.com' } ]

// We can also override default properties for each instance
const [jane, mary] = userFactory.buildMany(
  2,
  { name: 'Jane' },
  { name: 'Mary' },
);
jane.name; // 'Jane'
mary.name; // 'Mary'

// Finally, it's possible to apply the override for all the created objects:
const [user1, user2] = userFactory.buildMany(2, { name: 'Foo' });
user1.name; // 'Foo'
user2.name; // 'Foo'
```
