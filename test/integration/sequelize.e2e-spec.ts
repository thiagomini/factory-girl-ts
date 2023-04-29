import { Sequelize } from 'sequelize';
const sequelize = new Sequelize(
  'postgres://postgres:pass123@localhost:5432/postgres',
);

describe('Sequelize Integration', () => {
  it('authenticates', async () => {
    await expect(sequelize.authenticate()).resolves.toBeUndefined();
  });
});
