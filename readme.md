# Factory Girl TypeScript (factory-girl-ts)

`factory-girl-ts` is a modern, easy-to-use library for creating test data in Typescript projects. Drawing inspiration from the [factory_bot](https://github.com/thoughtbot/factory_bot) Ruby gem and the [fishery](https://github.com/thoughtbot/fishery) library, `factory-girl-ts` is designed for seamless integration with popular ORMs like [Sequelize](https://sequelize.org/) and [Typeorm](https://typeorm.io/).

## Why `factory-girl-ts`?

While `factory-girl` is a renowned library for creating test data in Node.js, it hasn't been updated since 2018. `factory-girl-ts` was born to fulfill the need for an updated, TypeScript-compatible library focusing on ease of use, especially when it comes to creating associations and asynchronous operations.

## Features

- **Simple, intuitive API:** Define and create test data in a breeze.
- **Seamless ORM integration:** Works like a charm with Sequelize and TypeORM.
- **Support for associations:** Effortlessly build and create models with associations.
- **Compatible with Repository and Active Record patterns:** Choose the pattern that suits your project best.

## Getting Started

Install `factory-girl-ts` using npm:

```bash
npm install factory-girl-ts
```

## How to Use factory-girl-ts

Factories in factory-girl-ts are instances of the Factory class, offering several methods for building and creating instances of your models.

- `build(override?)`: builds the target object, with an optional `override` parameter
- `buildMany(override?)`: builds an array of the target object
- `async create(override)`: creates an instance of the target object
- `async createMany(override)`: creates an array of instances of the target object

Let's see how to define a factory and use each of the methods above

### Defining a Factory (Sequelize Example)

```ts
import { User } from './models/user';
import { FactoryGirl, SequelizeAdapter } from 'factory-girl-ts';

// Step 1: Specify the adapter for your ORM.
FactoryGirl.setAdapter(new SequelizeAdapter());

// Step 2: Define your factory with default attributes for the model.
const defaultAttributesFactory = () => ({
  name: 'John',
  email: 'some-email@mail.com',
  address: {
    state: 'Some state',
    country: 'Some country',
  },
});
const userFactory = new FactoryGirl(User, defaultAttributesFactory);

// Step 3: Use the factory to create instances of the model.
const defaultUser = userFactory.build();
console.log(defaultUser);
// Output: { name: 'John', email: 'some-email@mail.com', state: 'Some state', country: 'Some country' }
```

### Overriding Default Properties

You can override default properties when creating a model instance:

```ts
const userWithCustomName = userFactory.build({ name: 'Jane' });
console.log(userWithCustomName);
// Output: { name: 'Jane', email: 'some-email@mail.com', 'Some state', country: 'Some country' }

// Overriding nested properties:
const userWithCustomAddress = userFactory.build({
  address: { state: 'Another state' },
});
console.log(userWithCustomAddress);
// Output: { name: 'John', email: 'some-email@mail', state: 'Another state', country: 'Some country' }
```

### Building Multiple Instances with `buildMany()`

The `buildMany()` function enables you to create multiple instances of a model at once. Let's walk through an example of how to use it.

```ts
import { User } from './models/user';
import { FactoryGirl, SequelizeAdapter } from 'factory-girl-ts';

// 1. Set the adapter for your ORM.
FactoryGirl.setAdapter(new SequelizeAdapter());

// 2. Define your factory with default attributes for the model.
const defaultAttributesFactory = () => ({
  name: 'John',
  email: 'some-email@mail.com',
});
const userFactory = new FactoryGirl(User, defaultAttributesFactory);

// 3. Create multiple instances of the model.
const users = userFactory.buildMany(2);
console.log(users);
// Output: [ { name: 'John', email: 'some-email@mail.com' }, { name: 'John', email: 'some-email@mail.com' } ]
```

#### Overriding Default Attributes for Multiple Instances

buildMany() also allows you to override default attributes for each created instance:

```ts
// Create multiple instances with custom attributes.
const [jane, mary] = userFactory.buildMany(
  2,
  { name: 'Jane' },
  { name: 'Mary' },
);
console.log(jane.name); // Output: 'Jane'
console.log(mary.name); // Output: 'Mary'
```

#### Applying the Same Override to All Instances

If you want to apply the same override to all instances, you can do that too:

```ts
// Create multiple instances with the same custom attribute.
const [user1, user2] = userFactory.buildMany(2, { name: 'Foo' });
console.log(user1.name); // Output: 'Foo'
console.log(user2.name); // Output: 'Foo'
```

By using buildMany(), you can efficiently create multiple model instances for your tests, with the flexibility to customize their attributes as needed.
