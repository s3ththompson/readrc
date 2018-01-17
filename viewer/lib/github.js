const format = require('date-fns/format')
const idb = require('idb-keyval')

module.exports = {
  upload: upload,
  get: get
}

var _saving = false;

function upload (json, token, cb) {
  if (_saving) cb(new Error('Save already in progress'), null);
  _saving = true;
  var filename = `readrc-${format(json.date, "YYYY-MM-DD--HH-mm-ss")}.json`
  var body = {
    description: `🗂 generated on ${format(json.date, "dddd, MMMM Do YYYY [at] h:mm a")}`,
    public: false,
    files: {
      [filename]: {
        content: JSON.stringify(json)
      }
    }
  }

  fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: new Headers({
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json'
    }),
    body: JSON.stringify(body)
  })
    .then(resp => { resp.json() })
    .then(json => {
      _saving = false;
      cb(null, json.id);
    })
    .catch(err => {
      _saving = false;
      cb(err, null)
    })
}

function get (id, token, cb) {
  var headers = new Headers();
  if (token) {
    headers.set('Authorization', `token ${token}`)
    headers.set('Accept', 'application/vnd.github.v3+json')
  }
  idb.get(id).then(cachedGist => {
    if (cachedGist && cachedGist.etag) {
      headers.set('If-None-Match', cachedGist.etag);
    }
  })

  fetch(`https://api.github.com/gists/${id}`, {headers: headers})
    .then(resp => {
      const remaining = resp.headers.get('X-RateLimit-Remaining');
      const limit = resp.headers.get('X-RateLimit-Limit');
      if (Number(remaining) < 10) {
        // todo: warn user
      }
      const etag = resp.headers.get('ETag');
      if (!resp.ok) {
        if (resp.status === 304) {
          cb(null, cachedGist.content)
        } else if (resp.status === 404) {
          // Delete the entry from IDB if it no longer exists on the server.
          idb.delete(id); // Note: async.
        }
        cb(new Error(`${resp.status} fetching gist`));
      }
      return resp
    })
    .then(resp => { return resp.json() })
    .then(json => {
      const fileName = Object.keys(json.files)[0]; // Attempt to use first file in gist.
      const f = json.files[fileName];
      if (f.truncated) {
        return fetch(f.raw_url)
          .then(resp => { resp.json() })
          .then(json => {
            cb(null, json)
            idb.set(id, {etag: etag, content: json})
          })
          .catch(cb)
      }
      cb(null, JSON.parse(f.content));
      idb.set(id, {etag: etag, content: JSON.parse(f.content)})
    })
    .catch(cb)

}

// function user (token, cb) {

// }

// function list (username, token, cb) {
//   fetch(`https://api.github.com/users/${username}/gists`, {
//     headers: new Headers({
//       Authorization: `token ${token}`,
//       Accept: 'application/vnd.github.v3+json'
//     })
//   })
//   .then(resp => resp.json())
//   .then(json => {

//   })
// }
