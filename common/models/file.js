var CONTAINERS_URL = '/api/containers/';
module.exports = function(File) {

  File.upload = function(ctx, options, cb) {
    if (!options) options = {};
    ctx.req.params.container = 'container';


    //    console.log(ctx.req.params);
    /*File.app.models.storage.getContainers(function(err, containers) {
      console.log('uuu', containers[0]);
    });*/
    File.app.models.storage.upload(ctx.req, ctx.res, options, function(err, fileObj) {
      console.log('XXXXXXX', fileObj);
      if (err) {
        cb(err);
      } else {
        var fileInfo = fileObj.files.file[0];
        File.create({
          name: fileInfo.name,
          type: fileInfo.type,
          container: fileInfo.container,
          url: CONTAINERS_URL + fileInfo.container + '/download/' + fileInfo.name
        }, function(err, obj) {
          if (err !== null) {
            cb(err);
          } else {
            cb(null, obj);
          }
        });
      }
    });







  };

  File.remoteMethod(
    'upload', {
      description: 'Uploads a file',
      accepts: [{
        arg: 'ctx',
        type: 'object',
        http: {
          source: 'context'
        }
      }, {
        arg: 'options',
        type: 'object',
        http: {
          source: 'query'
        }
      }],
      returns: {
        arg: 'fileObject',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post'
      }
    }
  );

};
