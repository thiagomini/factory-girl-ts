# Factory Girl TypeScript (factory-girl-ts)

`factory-girl-ts` is a modern, easy-to-use library for creating test data in Typescript projects. Drawing inspiration from the [factory_bot](https://github.com/thoughtbot/factory_bot) Ruby gem and the [fishery](https://github.com/thoughtbot/fishery) library, `factory-girl-ts` is designed for seamless integration with popular ORMs like [Sequelize](https://sequelize.org/) and [Typeorm](https://typeorm.io/).

## Why `factory-girl-ts`?

While `factory-girl` is a renowned library for creating test data in Node.js, it hasn't been updated since 2018. `factory-girl-ts` was born to fulfill the need for an updated, TypeScript-compatible library focusing on ease of use, especially when it comes to creating associations and asynchronous operations.

## TL;DR

`factory-girl-ts` is a TypeScript-compatible library created for crafting test data. It is designed to fit smoothly with ORMs such as [Sequelize](https://sequelize.org/) and [TypeORM](https://typeorm.io/).

Key features of `factory-girl-ts` include:

- **A Simple and Intuitive API**: This library makes the defining and creating of test data simple and quick.
- **Seamless ORM Integration**: It has been designed to integrate effortlessly with Sequelize and TypeORM.
- **Built-in Support for Associations**: It allows for simple creation of models with associations, making it perfect for complex data structures.
- **Repository and Active Record Pattern Compatibility**: Depending on your project's requirements, you can choose the most suitable pattern.

`factory-girl-ts` uses an instance of the Factory class to define factories. The Factory class offers several methods for building and creating instances of your models. You can create single or multiple instances, with or without custom attributes, and the library also supports creating instances with associations.

It also allows you to specify an adapter for your ORM, and currently supports three adapters: `TypeOrmRepositoryAdapter`, `SequelizeAdapter`, and `ObjectAdapter`.

Here's a simple class diagram showing how the main pieces of the library fit together:

```mermaid
classDiagram
    FactoryGirl --|> Factory : creates
    ModelAdapter <|.. TypeOrmRepositoryAdapter
    ModelAdapter <|.. SequelizeAdapter
    ModelAdapter <|.. ObjectAdapter
    FactoryGirl o-- ModelAdapter : uses
    Factory o-- Factory : associate
```

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

### Creating Instances with `create()`

The `create()` function allows you to create an instance of a model and save it to the database. Let's walk through an example of how to use it.

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
const defaultUser = await userFactory.create();

// The factory returns a sequelize instance of the given model. Therefore, we can use sequelize's methods:
console.log(defaultUser.get('name')); // Output: 'John'
```

You can also override default properties and create many instances of the model at once, just like with `build()` and `buildMany()`:

```ts
// Create an instance with custom attributes.
const userWithCustomName = await userFactory.create({ name: 'Jane' });
console.log(userWithCustomName.get('name')); // Output: 'Jane'

// Create multiple instances with custom attributes.
const [jane, mary] = await userFactory.createMany(
  2,
  { name: 'Jane' },
  { name: 'Mary' },
);
console.log(jane.get('name')); // Output: 'Jane'
console.log(mary.get('name')); // Output: 'Mary'

// Create multiple instances with the same custom attribute.
const [user1, user2] = await userFactory.createMany(2, { name: 'Foo' });
console.log(user1.get('name')); // Output: 'Foo'
console.log(user2.get('name')); // Output: 'Foo'
```

### Working with Associations

`factory-girl-ts` provides an easy way to create associations between models using the `associate()` method. This method links a model to another by using an attribute from the associated model.

Let's walk through an example to demonstrate how this works. We'll be using a `User` model and an `Address` model, where each user has one address.

```ts
// Define the User factory.
const defaultAttributesFactory = () => ({
  id: 1,
  name: 'John',
  email: 'some-email@mail.com',
});

const userFactory = FactoryGirl.define(User, defaultAttributesFactory);

// Define the Address factory, associating it with the User factory.
const addressFactory = FactoryGirl.define(Address, () => ({
  id: 1,
  street: '123 Fake St.',
  city: 'Springfield',
  state: 'IL',
  zip: '90210',
  userId: userFactory.associate('id'), // Associates the 'id' from the User model.
}));

const address = addressFactory.build();
const addressInDatabase = await addressFactory.create();

address.get('userId'); // Output: 1
addressInDatabase.get('userId'); // Output: 1
```

The `associate()` function coordinates with the method called in the parent factory. If you call `build()` on the parent factory, `associate()` will trigger the associated factory's `build()` method. Conversely, if you call `create()`, it will invoke the `create()` method in the associated factory.

Additionally, `associate()` allows you to specify a custom attribute (or 'key') for associating the models.

```ts
// Define the Address factory using a custom 'key' to associate with the User factory.
const addressFactory = FactoryGirl.define(Address, () => ({
  id: 1,
  street: '123 Fake St.',
  city: 'Springfield',
  state: 'IL',
  zip: '90210',
  userId: userFactory.associate('uuid'), // Uses the 'uuid' attribute from the User model for association.
}));
```

Lastly, the `associate()` method only comes into play if no value is provided for the given association. This prevents unnecessary creation of entities and can be particularly useful when you want to control the associated value.

```ts
// Create an Address instance with a specified 'userId'. This will bypass the 'associate()' method in the User factory.
const addressFromFirstUser = await addressFactory.create({
  userId: 1,
});
```

In summary, `factory-girl-ts` allows you to handle model associations seamlessly. The `associate()` method is a powerful tool that helps you link models together using their attributes, making it easier than ever to create complex data structures for your tests.

Stay tuned for more features and improvements. We are continuously working to make `factory-girl-ts` the most intuitive and efficient tool for generating test data in TypeScript!
