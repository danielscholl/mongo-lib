require('dotenv').config();

const test = require('tape');
const db = require('../index');

const before = test;
const after = test;

before('Database Connect', assert => {
	db.connect({db: 'test'}, (err, db) => {
		assert.ok(err === null, 'Database Connection Opened');
		assert.ok(db, 'should return a database when Opened');

		db.dropDb('test', (err, result) => {
			assert.ok(err === null, 'Database Table Dropped');
			assert.ok(result, 'should return true if Database Dropped');

			db.install(['foo'], (err, actual) => {
				assert.ok(actual, 'should return true if collection created');
				assert.end();
			});
    });
  });
});

test('Database Installed', assert => {
	db.dbExists('test', (err, actual) => {
		assert.ok(actual, 'should return true if db found');

		db.collectionExists('foo', (err, actual) => {
			assert.ok(actual, 'should return true if collection found');
			assert.end();
		});
	});
});

test('Collection saveData()', assert => {
	const message = 'should create an entity that contains an id';

	db.foo.saveData({name: Date.now()}, (err, actual) => {
		assert.ok(err === null, 'Database Row Created');
		assert.ok(actual.id, message);
		assert.end();
	});
});

test('Collection destroy()', assert => {
	const message = 'should return a true when destroyed';

	db.foo.saveData({name: Date.now()}, (err, row) => {
		assert.ok(err === null, 'Database Row Created');

		db.foo.destroy(row.id, (err, actual) => {
			assert.ok(actual, message);
			assert.end();
		});
	});
});

test('Collection updateOnly()', assert => {
	const message = 'should return a true when updated';

	db.foo.saveData({name: Date.now()}, (err, row) => {
		assert.ok(err === null, 'Database Row Created');

		db.foo.updateOnly({name: 'ChangedName'}, row.id, (err, actual) => {
			assert.ok(actual, message);
			assert.end();
		});
	});
});

test('Collection query()', assert => {
	const message = 'should return matched items when queried';
	const name = Date.now();

	db.foo.saveData({name: name}, (err, row) => {
		assert.ok(err === null, 'Database Row Created');

		db.foo.query({name: name}, (err, actual) => {
			assert.same(actual.length, 1, message);
			assert.end();
		});
	});
});

test('Collection first()', assert => {
	const message = 'should return the item when queried';
	const name = Date.now();

	db.foo.saveData({name: name}, (err, expected) => {
		assert.ok(err === null, 'Database Row Created');

		db.foo.first({name: name}, (err, actual) => {
			assert.same(actual.id, expected.id, message);
			assert.end();
		});
	});
});

test('Collection exists()', assert => {
	const message = 'should return true if item exists';
	const name = Date.now();

	db.foo.saveData({name: name}, (err, expected) => {
		assert.ok(err === null, 'Database Row Created');

		db.foo.exists({name: name}, (err, actual) => {
			assert.ok(actual, message);
			assert.end();
		});
	});
});

test('Collection destroyAll()', assert => {
	const message = 'should return amount of rows deleted';

	db.foo.saveData({name: Date.now()}, (err, expected) => {
		assert.ok(err === null, 'Database Row Created');

		db.foo.destroyAll((err, actual) => {
			assert.ok(actual > 0, message);
			assert.end();
		});
	});
});

after('after', assert => {
	db.close();
	assert.ok(true, 'Database Connection Closed');
	assert.end();
});
