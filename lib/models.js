
const Model = function() {
  let self = this;

  self.Config = function Config ({
		uri = process.env.DB_URI || null, 
		host = process.env.DB_HOST || 'localhost', 
		port = process.env.DB_PORT || 27017, 
		db = process.env.DB_NAME || test} = {}) {
    return {
      uri: uri,
      host: host,
      port: port,
	  	db: db,
			url: (name) => {
				let url = `mongodb://${host}:${port}/${db}`;

				if (uri !== null) return uri;
				if(process.env.DB_SSL) url = url + '?ssl=true';
				return url;
			}
    };
  };

  return self;
};

module.exports = new Model();
