exports.getData = function (ctx) {
  return new Promise(function (resolve, reject) {
    try {
      let str = ''
      ctx.req.on('data', function (chunk) {
        str += chunk
      })
      ctx.req.on('end', function (chunk) {
        resolve(str)
      })
    } catch (err) {
      reject(err)
    }
  })
}