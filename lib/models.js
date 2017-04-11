
const Model = function() {
  let self = this;

  self.Config = function Config ({uri = null, host = 'localhost', port = 27017, db} = {}) {
    return {
      uri: uri,
      host: host,
      port: port,
	  	db: db,
			url: (name) => {
				let url = 'mongodb://' + host + ':' + port + '/';

				if (uri !== null) return uri;
				if(name) return url + name; 
				return url + db;
			}
    };
  };

  return self;
};

module.exports = new Model();
